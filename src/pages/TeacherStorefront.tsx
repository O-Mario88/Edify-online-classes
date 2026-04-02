import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BookOpen, Star, Video, FileText, CheckCircle, Quote, Users, MessageCircle, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherStorefront: React.FC = () => {
    const [subscribing, setSubscribing] = useState(false);

    const handleSubscribe = () => {
        setSubscribing(true);
        setTimeout(() => setSubscribing(false), 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Cover */}
            <div className="relative h-64 bg-gradient-to-r from-blue-700 to-indigo-900 border-b">
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Profile Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
                    <img 
                        src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80" 
                        alt="Mr. Omondi"
                        className="w-32 h-32 md:w-48 md:h-48 rounded-2xl object-cover shadow-md border-4 border-white -mt-12 md:-mt-20"
                    />
                    <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 w-full">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h1 className="text-3xl font-bold text-gray-900">Mr. David Omondi</h1>
                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><CheckCircle className="w-3 h-3 mr-1" /> NCDC Verified</Badge>
                                </div>
                                <p className="text-xl text-gray-600 mb-3">Senior Physics & Mathematics Specialist</p>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                    <span className="flex items-center"><Star className="w-4 h-4 text-yellow-400 mr-1 fill-yellow-400" /> 4.9 Rating (142 Reviews)</span>
                                    <span className="flex items-center"><Users className="w-4 h-4 mr-1 text-blue-500" /> 2,400+ Active Students</span>
                                    <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1 text-green-500" /> 18 Premium Resources</span>
                                </div>

                                <p className="text-gray-700 leading-relaxed max-w-2xl">
                                    With over 12 years of experience preparing students for UCE and UACE examinations. 
                                    I specialize in breaking down complex kinematic equations into simple, visual frameworks. 
                                    Former Head of Science at Kampala Premier College.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 min-w-[200px]">
                                <Button 
                                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg" 
                                    disabled={subscribing}
                                    onClick={handleSubscribe}
                                >
                                    {subscribing ? 'Subscribing...' : 'Subscribe (15k UGX/mo)'}
                                </Button>
                                <Button variant="outline" className="w-full h-10 border-gray-300">
                                    <MessageCircle className="w-4 h-4 mr-2" /> Message Teacher
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Area */}
                <Tabs defaultValue="materials" className="mt-8">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="materials">Marketplace</TabsTrigger>
                        <TabsTrigger value="live">Live Bootcamps</TabsTrigger>
                        <TabsTrigger value="reviews">Student Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="materials" className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Complete UCE Physics Revision', type: 'Video Masterclass', price: '25,000 UGX', rating: 4.9, sales: 840, image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=500&q=60' },
                                { title: 'Kinematics Formula Guide', type: 'Premium Notes', price: '5,000 UGX', rating: 4.8, sales: 1200, image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=500&q=60' },
                                { title: 'Vector Addition Mock Set', type: 'Practice Exams', price: '10,000 UGX', rating: 4.7, sales: 450, image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=500&q=60' },
                                { title: 'A-Level Mechanics Deep Dive', type: 'Video Masterclass', price: '30,000 UGX', rating: 5.0, sales: 320, image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=500&q=60' }
                            ].map((item, idx) => (
                                <Card key={idx} className="overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-xl group cursor-pointer">
                                    <div className="h-40 overflow-hidden relative">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-2 right-2">
                                            <Badge className="bg-black/60 backdrop-blur-sm text-white border-0">
                                                {item.type.includes('Video') ? <Video className="w-3 h-3 mr-1 inline" /> : <FileText className="w-3 h-3 mr-1 inline" />}
                                                {item.type}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-lg leading-tight line-clamp-2">{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                            <span className="flex items-center"><Star className="w-3 h-3 text-yellow-400 mr-1 fill-yellow-400" /> {item.rating}</span>
                                            <span>{item.sales} sold</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-gray-900">{item.price}</span>
                                            <Button size="sm" className="bg-blue-50 text-blue-600 hover:bg-blue-100 h-8">Get Access</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="live" className="mt-8">
                        <div className="bg-white rounded-xl shadow-sm border p-8 text-center max-w-2xl mx-auto">
                            <Play className="w-16 h-16 text-red-100 fill-red-50 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Weekend Physics Bootcamp</h3>
                            <p className="text-gray-600 mb-6">
                                Join my intensive 2-hour live marathon this Saturday at 19:00 EAT where we break down past UNEB UCE exams. Limited to 50 students to ensure interactivity.
                            </p>
                            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 h-12 text-lg shadow-lg shadow-red-200">
                                Book Live Seat (20k UGX)
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { name: "Sarah K.", role: "S4 Student", quote: "Mr. Omondi essentially saved my UCE Physics grades. I was stuck at 45% consistently until his bootcamps." },
                                { name: "Mukasa P.", role: "A-Level Parent", quote: "The premium video notes are so high quality. We cast them to the living room TV and learn together. Worth every shilling."}
                            ].map((rev, i) => (
                                <Card key={i} className="bg-white hover:border-blue-200 transition-colors">
                                    <CardContent className="p-6">
                                        <Quote className="w-8 h-8 text-blue-100 fill-blue-50 mb-4" />
                                        <p className="text-gray-700 italic mb-4 leading-relaxed">"{rev.quote}"</p>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold text-gray-900">{rev.name}</div>
                                                <div className="text-sm text-gray-500">{rev.role}</div>
                                            </div>
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, starI) => <Star key={starI} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default TeacherStorefront;
