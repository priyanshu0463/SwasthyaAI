import React from "react";
import Layout from "../components/Layout";
import HealthCard from "@/components/Dashpoard/Health_card";
import { HeartPulse, Droplets, Activity, Sparkles, ArrowRight, Users, Shield, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import HealthSuggestions from "@/components/Dashpoard/HealthSuggestions";
import { useRouter } from "next/router";
import { Button } from "@/components/button";
import Image from "next/image";

const Home: React.FC = () => {
    // Sample data for charts
    const sugarData = [{ value: 75 }, { value: 80 }, { value: 85 }, { value: 82 }, { value: 80 }];
    const heartData = [{ value: 90 }, { value: 95 }, { value: 100 }, { value: 98 }, { value: 97 }];
    const pressureData = [{ value: 100 }, { value: 105 }, { value: 102 }, { value: 101 }, { value: 102 }];

    const router = useRouter();

    const initializeChat = async (qtype: string) => {
      router.push(`/chatbox?qtype=${qtype}`);
    };

    const features = [
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: "AI-Powered Diagnosis",
            description: "Get instant insights into your health concerns with our advanced AI technology."
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Expert Doctor Network",
            description: "Connect with qualified healthcare professionals when you need specialized care."
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "AYUSH-Based Remedies",
            description: "Discover natural, traditional healing methods backed by centuries of wisdom."
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Instant Health Check",
            description: "Get personalized health recommendations tailored to your unique profile."
        }
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
                {/* Hero Section */}
                <div className="relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                                Your Health Journey Starts
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600"> Here</span>
                            </h1>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                                Experience personalized healthcare with AI-powered insights, expert consultations, and AYUSH-based natural remedies.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button 
                                    onClick={() => initializeChat("default")}
                                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Start Health Check
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                                <Button 
                                    variant="outline"
                                    onClick={() => initializeChat("describe")}
                                    className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                                >
                                    Describe Your Symptoms
                                </Button>
                            </div>
                        </div>

                        {/* Health Metrics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                            <div className="transform hover:scale-105 transition-all duration-300">
                                <HealthCard 
                                    title="Blood Sugar" 
                                    value="80" 
                                    unit="mg/dL" 
                                    status="Normal" 
                                    color="#F4A261" 
                                    icon={<Droplets />} 
                                    data={sugarData} 
                                />
                            </div>
                            <div className="transform hover:scale-105 transition-all duration-300">
                                <HealthCard 
                                    title="Heart Rate" 
                                    value="98" 
                                    unit="bpm" 
                                    status="Normal" 
                                    color="#E76F51" 
                                    icon={<HeartPulse />} 
                                    data={heartData} 
                                />
                            </div>
                            <div className="transform hover:scale-105 transition-all duration-300">
                                <HealthCard 
                                    title="Blood Pressure" 
                                    value="102/72" 
                                    unit="mmHg" 
                                    status="Normal" 
                                    color="#2A9D8F" 
                                    icon={<Activity />} 
                                    data={pressureData} 
                                />
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Health Suggestions */}
                            <div className="lg:col-span-2">
                                <Card className="h-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                                    <CardContent className="p-0">
                                        <HealthSuggestions />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Smart Health Checkup Panel */}
                            <div className="lg:col-span-1">
                                <Card className="h-full bg-gradient-to-br from-blue-50 to-green-50 border-0 shadow-xl">
                                    <CardContent className="p-8 h-full flex flex-col justify-between">
                                        <div className="text-center mb-8">
                                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                                                <Image 
                                                    src="/poster.png" 
                                                    alt="Health Check" 
                                                    width={80} 
                                                    height={80}
                                                    className="rounded-full"
                                                />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                                Smart Health Checkup
                                            </h3>
                                            <p className="text-gray-600 text-lg leading-relaxed">
                                                Not feeling well? Let AI guide you to better health with personalized recommendations.
                                            </p>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <Button 
                                                onClick={() => initializeChat("remedy")}
                                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                                            >
                                                <Sparkles className="w-5 h-5" />
                                                Get Natural Remedies
                                            </Button>
                                            
                                            <Button 
                                                onClick={() => initializeChat("doctor")}
                                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                                            >
                                                <Users className="w-5 h-5" />
                                                Find Expert Doctors
                                            </Button>
                                            
                                            <Button 
                                                onClick={() => initializeChat("describe")}
                                                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                                            >
                                                <Zap className="w-5 h-5" />
                                                Describe Your Symptoms
                                            </Button>
                                        </div>

                                        <Button 
                                            onClick={() => initializeChat("default")}
                                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                            Start Health Journey Now
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="mt-20">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                    Why Choose Swasthya AI?
                                </h2>
                                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                    Experience the future of healthcare with our comprehensive AI-powered platform
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {features.map((feature, index) => (
                                    <Card key={index} className="text-center p-6 hover:shadow-xl transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm">
                                        <CardContent className="p-0">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white">
                                                {feature.icon}
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                {feature.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
