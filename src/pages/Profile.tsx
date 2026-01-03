import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation, LANGUAGES } from '@/components/TranslationProvider';
import { useToast } from '@/hooks/use-toast';
import { updateProfile, changePassword, addAddress, getAddresses, updateAddress, deleteAddress } from '@/services/profile';
import { getStateShippingRates } from '@/services/state-shipping';
import { User, Lock, MapPin, Edit, Trash2, Plus, RefreshCw, Package, Calendar, CreditCard, Truck, FileText, Download, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatPrice } from '@/lib/utils';
import { generateOrderReceipt, downloadOrderReceiptHTML } from '@/utils/htmlPdfGenerator';


const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const isTamil = language === LANGUAGES.TAMIL;
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
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

  // Orders data
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  

  
  // Address data
  const [addresses, setAddresses] = useState<any[]>([]);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [stateRates, setStateRates] = useState<any[]>([]);
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
    if (user?.id) {
      loadAddresses();
      loadOrders();
      loadStateRates();
    }
  }, [user]);

  const loadAddresses = async () => {
    if (user?.id) {
      const userAddresses = await getAddresses(user.id);
      setAddresses(userAddresses);
    }
  };
  
  const loadOrders = async () => {
    if (!user?.email) return;
    setLoadingOrders(true);
    try {
      const response = await fetch(`https://api.dharaniherbbals.com/api/orders?filters[email][$eq]=${user.email}&sort=createdAt:desc`);
      const data = await response.json();
      
      setOrders(data.data || []);
    } catch (error) {
      
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadStateRates = async () => {
    try {
      const rates = await getStateShippingRates();
      setStateRates(rates);
    } catch (error) {
      console.error('Error loading state rates:', error);
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  

  
  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setNewAddress({
      type: address.attributes?.type || address.type || 'shipping',
      fullName: address.attributes?.fullName || address.fullName || '',
      phone: address.attributes?.phone || address.phone || '',
      address: address.attributes?.address || address.address || '',
      city: address.attributes?.city || address.city || '',
      state: address.attributes?.state || address.state || '',
      pincode: address.attributes?.pincode || address.pincode || '',
      isDefault: address.attributes?.isDefault || address.isDefault || false
    });
  };
  
  const handleDeleteAddress = async (addressId: number) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setIsLoading(true);
      try {
        const success = await deleteAddress(addressId);
        if (success) {
          toast({ title: "Success", description: "Address deleted successfully" });
          loadAddresses();
        } else {
          toast({ title: "Error", description: "Failed to delete address", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Error", description: "Address deletion failed", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleCancelEdit = () => {
    setEditingAddress(null);
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
      let success;
      
      if (editingAddress) {
        success = await updateAddress(editingAddress.id, newAddress);
        if (success) {
          toast({ title: "Success", description: "Address updated successfully" });
        }
      } else {
        success = await addAddress(user?.id, newAddress);
        if (success) {
          toast({ title: "Success", description: "Address added successfully" });
        }
      }
      
      if (success) {
        handleCancelEdit();
        loadAddresses();
      } else {
        toast({ title: "Error", description: `Failed to ${editingAddress ? 'update' : 'add'} address`, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: `Address ${editingAddress ? 'update' : 'addition'} failed`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <SEOHead 
        title="My Profile"
        description="Manage your account, view order history, update addresses and personal information."
        url="/profile"
      />
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full mb-4 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              My Profile
            </h1>
            <p className="text-gray-600 text-lg">Welcome back, {user?.username}!</p>
          </div>
          
          <Tabs defaultValue="orders" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg rounded-xl p-2 border">
              <TabsTrigger value="orders" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Password</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Addresses</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-t-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Package className="w-5 h-5" />
                      My Orders ({orders.length})
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={loadOrders} disabled={loadingOrders} className="w-full sm:w-auto">
                      <RefreshCw className={`w-4 h-4 mr-2 ${loadingOrders ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  {loadingOrders ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading orders...</p>
                    </div>
                  ) : (orders.length === 0) ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No orders found</p>
                      <p className="text-gray-400 text-sm">Your order history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Completed Orders Section */}
                      {orders.length > 0 && (
                          <div className="space-y-4">
                            {orders.map((order) => {
                              const attrs = order.attributes || order;
                              const orderDate = new Date(attrs.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              });
                              
                              return (
                                <div key={order.id} className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                                    <div className="flex-1">
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                                        <div>
                                          <h3 className="font-bold text-lg text-gray-800">Order #{attrs.ordernum || 'N/A'}</h3>
                                          <p className="text-sm text-gray-500">Invoice: {attrs.invoicenum || 'N/A'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            attrs.payment === 'Online Payment' ? 'bg-blue-100 text-blue-800' :
                                            'bg-orange-100 text-orange-800'
                                          }`}>
                                            {attrs.payment || 'COD'}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <Calendar className="w-4 h-4" />
                                          <span className="text-sm">{orderDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <CreditCard className="w-4 h-4" />
                                          <span className="text-sm font-semibold">{formatPrice(attrs.totalValue || attrs.total || 0)}</span>
                                        </div>
                                      </div>
                                      
                                      <div className="mb-4">
                                        <h4 className="font-semibold text-gray-700 mb-2">Customer: {attrs.customername}</h4>
                                        <p className="text-sm text-gray-600">Phone: {attrs.phoneNum}</p>
                                        <p className="text-sm text-gray-600">Quantity: {
                                          (() => {
                                            const dataField = attrs.price || attrs.Name;
                                            if (!dataField) return '0';
                                            // Extract quantities from product strings and sum them
                                            return dataField.split('|').reduce((sum, product) => {
                                              const qtyMatch = product.trim().match(/x\s*(\d+)/i);
                                              const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
                                              return sum + qty;
                                            }, 0);
                                          })()
                                        } items</p>
                                        {attrs.Name && (
                                          <div className="mt-2">
                                            <p className="text-sm font-medium text-gray-700">Items:</p>

                                            <div className="mt-2 border rounded-md overflow-hidden">
                                              <table className="w-full">
                                                <thead className="bg-gray-50">
                                                  <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Quantity</th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                  {(attrs.price || attrs.Name).split('|').map((product, index) => {
                                                    const productStr = product.trim();
                                                    // Extract quantity from price field format: "PRODUCT: ₹price x quantity"
                                                    const qtyMatch = productStr.match(/x\s*(\d+)/i);
                                                    const qty = qtyMatch ? qtyMatch[1] : '1';
                                                    // Extract product name (everything before the colon)
                                                    const productName = productStr.split(':')[0].trim();
                                                    return (
                                                      <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2 text-sm text-gray-600">{productName}</td>
                                                        <td className="px-3 py-2 text-sm text-gray-600 text-right">{qty}</td>
                                                      </tr>
                                                    );
                                                  })}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        )}
                                        {attrs.remarks && (
                                          <p className="text-sm text-gray-600 mt-2">Notes: {attrs.remarks}</p>
                                        )}
                                      </div>
                                      
                                      {attrs.shippingAddress && (
                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                          <Truck className="w-4 h-4 mt-1" />
                                          <div>
                                            <span className="font-medium">Delivery Address:</span>
                                            <p className="mt-1">{attrs.shippingAddress}</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                          required
                          className="mt-2 h-12 border-gray-200 focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          required
                          className="mt-2 h-12 border-gray-200 focus:border-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        required
                        className="mt-2 h-12 border-gray-200 focus:border-primary"
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg">
                      {isLoading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        required
                        className="mt-2 h-12 border-gray-200 focus:border-primary"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          required
                          className="mt-2 h-12 border-gray-200 focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          required
                          className="mt-2 h-12 border-gray-200 focus:border-primary"
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg">
                      {isLoading ? 'Changing...' : 'Change Password'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses">
              <div className="space-y-8">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-100 to-green-50 rounded-t-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Plus className="w-5 h-5" />
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </CardTitle>
                      {editingAddress && (
                        <Button variant="outline" size="sm" onClick={handleCancelEdit} className="w-full sm:w-auto">
                          Cancel Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleAddAddress} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="type" className="text-sm font-medium text-gray-700">Address Type</Label>
                          <select
                            id="type"
                            className="w-full mt-2 h-12 px-3 border border-gray-200 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                            value={newAddress.type}
                            onChange={(e) => setNewAddress({...newAddress, type: e.target.value})}
                          >
                            <option value="shipping">Shipping</option>
                            <option value="billing">Billing</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                          <Input
                            id="fullName"
                            value={newAddress.fullName}
                            onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                            required
                            className="mt-2 h-12 border-gray-200 focus:border-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                          required
                          className="mt-2 h-12 border-gray-200 focus:border-primary"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                        <Textarea
                          id="address"
                          value={newAddress.address}
                          onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                          required
                          className="mt-2 border-gray-200 focus:border-primary min-h-[100px]"
                        />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-6">
                        <div>
                          <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                            required
                            className="mt-2 h-12 border-gray-200 focus:border-primary"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                          <select
                            id="state"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                            required
                            className="mt-2 h-12 border-gray-200 focus:border-primary w-full rounded-md border px-3 py-2"
                          >
                            <option value="">Select State</option>
                            {stateRates.map(state => (
                              <option key={state.stateCode} value={state.stateName}>
                                {state.stateName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="pincode" className="text-sm font-medium text-gray-700">Pincode</Label>
                          <Input
                            id="pincode"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                            required
                            className="mt-2 h-12 border-gray-200 focus:border-primary"
                          />
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg text-white font-semibold">
                          {isLoading ? (editingAddress ? 'Updating...' : 'Adding...') : (editingAddress ? 'Update Address' : 'Add Address')}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-t-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <MapPin className="w-5 h-5" />
                        Saved Addresses ({addresses.length})
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={loadAddresses} className="w-full sm:w-auto">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8">
                    {addresses.length === 0 ? (
                      <div className="text-center py-12">
                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No addresses saved</p>
                        <p className="text-gray-400 text-sm">Add your first address above</p>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {addresses.map((address, index) => {
                          const attrs = address.attributes || address;
                          return (
                            <div key={address.id || index} className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <h4 className="font-bold text-lg text-gray-800">{attrs.fullName}</h4>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${attrs.type === 'shipping' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                      {attrs.type}
                                    </span>
                                  </div>
                                  <div className="space-y-2 text-gray-600">
                                    <p className="flex items-start gap-2">
                                      <MapPin className="w-4 h-4 mt-1 text-gray-400" />
                                      {attrs.address}
                                    </p>
                                    <p className="ml-6">{attrs.city}, {attrs.state} - {attrs.pincode}</p>
                                    <p className="ml-6">Phone: {attrs.phone}</p>
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleEditAddress(address)}
                                    className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span className="hidden sm:inline">Edit</span>
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={() => handleDeleteAddress(address.id)}
                                    className="flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Delete</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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