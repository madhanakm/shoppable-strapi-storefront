import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { updateProfile, changePassword, addAddress, getAddresses } from '@/services/profile';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile data
  const [profile, setProfile] = useState({
    name: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Address data
  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddress, setNewAddress] = useState({
    type: 'shipping',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    if (user?.id) {
      const userAddresses = await getAddresses(user.id);
      setAddresses(userAddresses);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await updateProfile(user?.id, profile);
      if (success) {
        toast({ title: "Success", description: "Profile updated successfully" });
      } else {
        toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Profile update failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const success = await changePassword(user?.id, passwordData.currentPassword, passwordData.newPassword);
      if (success) {
        toast({ title: "Success", description: "Password changed successfully" });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast({ title: "Error", description: "Current password is incorrect", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Password change failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await addAddress(user?.id, newAddress);
      if (success) {
        toast({ title: "Success", description: "Address added successfully" });
        setNewAddress({
          type: 'shipping',
          fullName: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          isDefault: false
        });
        loadAddresses();
      } else {
        toast({ title: "Error", description: "Failed to add address", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Address addition failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Changing...' : 'Change Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type">Address Type</Label>
                          <select
                            id="type"
                            className="w-full p-2 border rounded"
                            value={newAddress.type}
                            onChange={(e) => setNewAddress({...newAddress, type: e.target.value})}
                          >
                            <option value="shipping">Shipping</option>
                            <option value="billing">Billing</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={newAddress.fullName}
                            onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={newAddress.address}
                          onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Adding...' : 'Add Address'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Saved Addresses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {addresses.length === 0 ? (
                      <p className="text-muted-foreground">No addresses saved</p>
                    ) : (
                      <div className="space-y-4">
                        {addresses.map((address, index) => (
                          <div key={index} className="p-4 border rounded">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{address.fullName}</h4>
                                <p className="text-sm text-muted-foreground">{address.type}</p>
                                <p>{address.address}</p>
                                <p>{address.city}, {address.state} - {address.pincode}</p>
                                <p>Phone: {address.phone}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;