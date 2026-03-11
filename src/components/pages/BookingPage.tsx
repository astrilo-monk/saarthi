import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video, CheckCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCrudService } from '@/integrations';
import { Counselors } from '@/entities/counselors';
import { Image } from '@/components/ui/image';

interface BookingForm {
  counselorId: string;
  date: string;
  time: string;
  mode: 'online' | 'in-person';
  anonymousId: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
}

export default function BookingPage() {
  const [counselors, setCounselors] = useState<Counselors[]>([]);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselors | null>(null);
  const [formData, setFormData] = useState<BookingForm>({
    counselorId: '',
    date: '',
    time: '',
    mode: 'online',
    anonymousId: `ANON-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    reason: '',
    urgency: 'medium'
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const { items } = await BaseCrudService.getAll<Counselors>('counselors');
        setCounselors(items);
      } catch (error) {
        console.error('Error fetching counselors:', error);
      }
    };

    fetchCounselors();
  }, []);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setShowConfirmation(true);
    setIsSubmitting(false);
  };

  const handleCounselorSelect = (counselor: Counselors) => {
    setSelectedCounselor(counselor);
    setFormData(prev => ({ ...prev, counselorId: counselor._id }));
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-[120rem] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Book a Counseling Session
          </h1>
          <p className="text-lg font-paragraph text-gray-600 max-w-3xl mx-auto">
            Schedule a confidential session with one of our licensed mental health professionals. 
            All appointments are completely private and secure.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Counselor Selection */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                Choose Your Counselor
              </h2>
              
              <div className="space-y-4">
                {counselors.map((counselor) => (
                  <motion.div
                    key={counselor._id}
                    whileHover={{ scale: 1.02 }}
                    className={`bg-white p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedCounselor?._id === counselor._id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                    onClick={() => handleCounselorSelect(counselor)}
                  >
                    <div className="flex items-start space-x-4">
                      {counselor.profilePicture ? (
                        <Image
                          src={counselor.profilePicture}
                          alt={`${counselor.counselorName} profile photo`}
                          width={64}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-foreground mb-1">
                          {counselor.counselorName}
                        </h3>
                        <p className="font-paragraph text-sm text-primary mb-2">
                          {counselor.specialty}
                        </p>
                        <p className="font-paragraph text-sm text-gray-600 mb-3">
                          {counselor.bio}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {counselor.isOnlineAvailable && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-paragraph">
                              Online
                            </span>
                          )}
                          {counselor.isInPersonAvailable && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-paragraph">
                              In-Person
                            </span>
                          )}
                        </div>
                        
                        {counselor.languagesSpoken && (
                          <p className="font-paragraph text-xs text-gray-500 mt-2">
                            Languages: {counselor.languagesSpoken}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  Appointment Details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Anonymous ID */}
                  <div>
                    <label className="block font-paragraph font-medium text-foreground mb-2">
                      Your Anonymous ID
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-paragraph text-sm text-gray-600 mb-2">
                        This ID will be used to identify your appointment while maintaining your privacy.
                      </p>
                      <p className="font-paragraph font-bold text-foreground">{formData.anonymousId}</p>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block font-paragraph font-medium text-foreground mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      min={getMinDate()}
                      max={getMaxDate()}
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-paragraph"
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block font-paragraph font-medium text-foreground mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Preferred Time
                    </label>
                    <select
                      required
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-paragraph"
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  {/* Mode Selection */}
                  <div>
                    <label className="block font-paragraph font-medium text-foreground mb-2">
                      Session Mode
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, mode: 'online' }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.mode === 'online'
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        disabled={selectedCounselor && !selectedCounselor.isOnlineAvailable}
                      >
                        <Video className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="font-paragraph font-medium text-foreground">Online</p>
                        <p className="font-paragraph text-sm text-gray-600">Video call session</p>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, mode: 'in-person' }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.mode === 'in-person'
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        disabled={selectedCounselor && !selectedCounselor.isInPersonAvailable}
                      >
                        <MapPin className="w-6 h-6 mx-auto mb-2 text-primary" />
                        <p className="font-paragraph font-medium text-foreground">In-Person</p>
                        <p className="font-paragraph text-sm text-gray-600">Campus office visit</p>
                      </button>
                    </div>
                  </div>

                  {/* Urgency Level */}
                  <div>
                    <label className="block font-paragraph font-medium text-foreground mb-2">
                      Urgency Level
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as 'low' | 'medium' | 'high' }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-paragraph"
                    >
                      <option value="low">Low - General support</option>
                      <option value="medium">Medium - Need to talk soon</option>
                      <option value="high">High - Urgent support needed</option>
                    </select>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block font-paragraph font-medium text-foreground mb-2">
                      Brief Description (Optional)
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Briefly describe what you'd like to discuss (this helps your counselor prepare)"
                      rows={4}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-paragraph resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!selectedCounselor || !formData.date || !formData.time || isSubmitting}
                    className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-paragraph font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Booking Appointment...' : 'Book Appointment'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <h3 className="text-2xl font-heading font-bold text-foreground mb-4">
                  Appointment Confirmed!
                </h3>
                
                <div className="space-y-3 mb-6">
                  <p className="font-paragraph text-gray-600">
                    <strong>Anonymous ID:</strong> {formData.anonymousId}
                  </p>
                  <p className="font-paragraph text-gray-600">
                    <strong>Date:</strong> {new Date(formData.date).toLocaleDateString()}
                  </p>
                  <p className="font-paragraph text-gray-600">
                    <strong>Time:</strong> {formData.time}
                  </p>
                  <p className="font-paragraph text-gray-600">
                    <strong>Mode:</strong> {formData.mode === 'online' ? 'Online Video Call' : 'In-Person'}
                  </p>
                  <p className="font-paragraph text-gray-600">
                    <strong>Counselor:</strong> {selectedCounselor?.counselorName}
                  </p>
                </div>
                
                <p className="font-paragraph text-sm text-gray-600 mb-6">
                  You will receive a confirmation email with session details. Please save your Anonymous ID for reference.
                </p>
                
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-paragraph font-medium hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}