"""
main.py

Real-time webcam face analysis optimized for FPS:
 - Capture thread to avoid blocking reads
 - Worker thread to analyze frames every Nth frame
 - Resizing before analysis
 - Fallback to OpenCV Haar detector if DeepFace/TensorFlow fails
 - Mirror (invert) camera feed for natural "selfie" effect

Usage:
    python realtime_deepface_fast_inverted.py

Press 'q' to quit.
"""

import cv2
import threading
import queue
import time

# Try to import DeepFace; keep robust if missing
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except Exception as e:
    print("DeepFace import failed or unavailable:", e)
    DEEPFACE_AVAILABLE = False

# ------- CONFIG -------
CAMERA_INDEX = 0            # default camera
ANALYZE_EVERY_N_FRAMES = 3  # smaller -> more responsive face tracking
ANALYZE_SIZE = (320, 240)   # resized frame for faster analysis
DETECTOR_BACKEND = 'opencv' # 'opencv','mediapipe','mtcnn','retinaface',...
ENFORCE_DETECTION = False   # avoid crashes when no face found
SHOW_FPS = True
MIRROR_FEED = True          # <-- mirror camera feed (selfie mode)
# ----------------------

class VideoCaptureThread:
    def __init__(self, src=0, queue_size=2):
        self.cap = cv2.VideoCapture(src)
        self.q = queue.Queue(maxsize=queue_size)
        self.stopped = False
        self.thread = threading.Thread(target=self._reader, daemon=True)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    def start(self):
        self.thread.start()
        return self

    def _reader(self):
        while not self.stopped:
            ret, frame = self.cap.read()
            if not ret:
                self.stop()
                break
            if not self.q.empty():
                try:
                    self.q.get_nowait()
                except queue.Empty:
                    pass
            self.q.put(frame)
            time.sleep(0.001)

    def read(self):
        if not self.q.empty():
            return True, self.q.get()
        else:
            return False, None

    def stop(self):
        self.stopped = True
        try:
            self.cap.release()
        except:
            pass

def draw_result(frame, result):
    try:
        if not result:
            return frame
        res = result[0] if isinstance(result, list) and result else result
        box = None
        if 'region' in res and res['region']:
            r = res['region']
            box = (int(r.get('x',0)), int(r.get('y',0)),
                   int(r.get('w',0)), int(r.get('h',0)))
        elif 'box' in res and res['box']:
            box = res['box']
        if box:
            x,y,w,h = box
            x = max(0, x); y = max(0, y)
            cv2.rectangle(frame, (x,y), (x+w, y+h), (0,255,0), 2)
        # Only show emotion (removed age and gender)
        text = ""
        if 'dominant_emotion' in res and res.get('dominant_emotion'):
            text = str(res['dominant_emotion'])
        if text:
            tx, ty = (x, y-10) if box else (10,30)
            ty = max(20, ty)
            cv2.putText(frame, text, (tx, ty),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                        (0,255,0), 2, cv2.LINE_AA)
    except Exception:
        pass
    return frame

def haar_detect_faces_gray(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30,30)):
    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    face_cascade = cv2.CascadeClassifier(cascade_path)
    faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=scaleFactor,
                                          minNeighbors=minNeighbors, minSize=minSize)
    return [(int(x), int(y), int(w), int(h)) for (x,y,w,h) in faces]

def analysis_worker(in_q, out_q, stop_event):
    while not stop_event.is_set():
        try:
            frame_id, frame = in_q.get(timeout=0.2)
        except queue.Empty:
            continue
        result = None
        small = cv2.resize(frame, ANALYZE_SIZE)
        if DEEPFACE_AVAILABLE:
            try:
                df_res = DeepFace.analyze(
                    img_path=small,
                    actions=['emotion'],
                    detector_backend=DETECTOR_BACKEND,
                    enforce_detection=ENFORCE_DETECTION
                )
                # Handle both list and dict returns from DeepFace
                if isinstance(df_res, list) and df_res:
                    df_res = df_res[0]
                if isinstance(df_res, dict) and df_res.get('region'):
                    sx = frame.shape[1] / small.shape[1]
                    sy = frame.shape[0] / small.shape[0]
                    r = df_res['region']
                    df_res['region'] = {
                        'x': int(r.get('x',0)*sx),
                        'y': int(r.get('y',0)*sy),
                        'w': int(r.get('w',0)*sx),
                        'h': int(r.get('h',0)*sy)
                    }
                result = df_res
            except Exception:
                gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
                boxes = haar_detect_faces_gray(gray)
                if boxes:
                    bx,by,bw,bh = boxes[0]
                    sx = frame.shape[1]/small.shape[1]
                    sy = frame.shape[0]/small.shape[0]
                    result = {'box': (int(bx*sx), int(by*sy),
                                      int(bw*sx), int(bh*sy))}
        else:
            gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
            boxes = haar_detect_faces_gray(gray)
            if boxes:
                bx,by,bw,bh = boxes[0]
                sx = frame.shape[1]/small.shape[1]
                sy = frame.shape[0]/small.shape[0]
                result = {'box': (int(bx*sx), int(by*sy),
                                  int(bw*sx), int(bh*sy))}
        if not out_q.empty():
            try: out_q.get_nowait()
            except: pass
        out_q.put((frame_id, result))

def main():
    cap_thread = VideoCaptureThread(src=CAMERA_INDEX).start()
    in_q = queue.Queue(maxsize=4)
    out_q = queue.Queue(maxsize=2)
    stop_event = threading.Event()
    worker = threading.Thread(target=analysis_worker,
                              args=(in_q, out_q, stop_event), daemon=True)
    worker.start()

    last_result = None
    frame_id = 0
    fps = 0.0
    fps_t0 = time.time()
    displayed_frames = 0

    try:
        while True:
            ret, frame = cap_thread.read()
            if not ret:
                time.sleep(0.01)
                continue

            # 👇 Mirror feed
            if MIRROR_FEED:
                frame = cv2.flip(frame, 1)

            frame_id += 1
            displayed_frames += 1

            if frame_id % ANALYZE_EVERY_N_FRAMES == 0:
                try:
                    if not in_q.empty():
                        try: in_q.get_nowait()
                        except: pass
                    in_q.put((frame_id, frame.copy()), block=False)
                except queue.Full:
                    pass

            try:
                got_id, got_res = out_q.get_nowait()
                last_result = got_res
            except queue.Empty:
                pass

            annotated = draw_result(frame, last_result)

            if SHOW_FPS:
                t_now = time.time()
                elapsed = t_now - fps_t0
                if elapsed >= 1.0:
                    fps = displayed_frames / elapsed
                    fps_t0 = t_now
                    displayed_frames = 0
                cv2.putText(annotated, f"FPS: {fps:.1f}", (10,20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                            (0,255,255), 2, cv2.LINE_AA)

            cv2.imshow("Fast Webcam - DeepFace (press q to quit)", annotated)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        stop_event.set()
        cap_thread.stop()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
