import { useMember } from '@/integrations';
import { User, Mail, Calendar, Settings, Shield } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function ProfilePage() {
  const { member } = useMember();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-[120rem] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Your Profile
          </h1>
          <p className="text-lg font-paragraph text-gray-600 max-w-3xl mx-auto">
            Manage your account settings and view your activity on Saarthi.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                {member?.profile?.photo?.url ? (
                  <Image
                    src={member.profile.photo.url}
                    alt="Profile photo"
                    width={120}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-6"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                )}
                
                <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                  {member?.profile?.nickname || member?.contact?.firstName || 'Anonymous User'}
                </h2>
                
                {member?.profile?.title && (
                  <p className="font-paragraph text-gray-600 mb-4">{member.profile.title}</p>
                )}
                
                <div className="space-y-3">
                  {member?.loginEmail && (
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="font-paragraph">{member.loginEmail}</span>
                      {member.loginEmailVerified && (
                        <Shield className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  )}
                  
                  {member?._createdDate && (
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="font-paragraph">
                        Member since {new Date(member._createdDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-heading font-bold text-foreground">Account Information</h3>
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-paragraph text-sm hover:bg-primary/90 transition-colors inline-flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-paragraph font-medium text-foreground mb-2">
                      Display Name
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-paragraph text-gray-700">
                        {member?.profile?.nickname || 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-paragraph font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-paragraph text-gray-700">
                        {member?.loginEmail || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-paragraph font-medium text-foreground mb-2">
                      First Name
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-paragraph text-gray-700">
                        {member?.contact?.firstName || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-paragraph font-medium text-foreground mb-2">
                      Last Name
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-paragraph text-gray-700">
                        {member?.contact?.lastName || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-paragraph font-medium text-foreground mb-2">
                      Account Status
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className={`px-2 py-1 rounded-full font-paragraph text-xs ${
                        member?.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        member?.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member?.status || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-paragraph font-medium text-foreground mb-2">
                      Last Login
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-paragraph text-gray-700">
                        {member?.lastLoginDate 
                          ? new Date(member.lastLoginDate).toLocaleDateString()
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy & Security */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
                <h3 className="text-2xl font-heading font-bold text-foreground mb-6">Privacy & Security</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-heading font-bold text-foreground mb-1">Anonymous Mode</h4>
                      <p className="font-paragraph text-sm text-gray-600">
                        Your identity is protected in all forum posts and chat sessions
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-paragraph text-xs">
                      Active
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <h4 className="font-heading font-bold text-foreground mb-1">Data Encryption</h4>
                      <p className="font-paragraph text-sm text-gray-600">
                        All your conversations and data are encrypted end-to-end
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-paragraph text-xs">
                      Enabled
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <h4 className="font-heading font-bold text-foreground mb-1">Email Verification</h4>
                      <p className="font-paragraph text-sm text-gray-600">
                        Your email address has been verified for account security
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full font-paragraph text-xs ${
                      member?.loginEmailVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member?.loginEmailVerified ? 'Verified' : 'Pending'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-8">
                <h3 className="text-2xl font-heading font-bold text-foreground mb-6">Activity Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-heading font-bold text-foreground mb-1">Chat Sessions</h4>
                    <p className="text-2xl font-heading font-bold text-blue-600">12</p>
                    <p className="font-paragraph text-xs text-gray-600">This month</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-heading font-bold text-foreground mb-1">Appointments</h4>
                    <p className="text-2xl font-heading font-bold text-green-600">3</p>
                    <p className="font-paragraph text-xs text-gray-600">Completed</p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Settings className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-heading font-bold text-foreground mb-1">Forum Posts</h4>
                    <p className="text-2xl font-heading font-bold text-purple-600">8</p>
                    <p className="font-paragraph text-xs text-gray-600">Contributions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}