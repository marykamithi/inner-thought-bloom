import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, Heart, ExternalLink, Shield, Clock } from "lucide-react";

interface SupportResource {
  id: string;
  name: string;
  description: string;
  phone?: string;
  website?: string;
  availability: string;
  type: 'crisis' | 'support' | 'emergency';
  country: string;
}

const supportResources: SupportResource[] = [
  // Crisis Lines
  {
    id: 'suicide-prevention',
    name: 'National Suicide Prevention Lifeline',
    description: 'Free and confidential emotional support for people in suicidal crisis or emotional distress.',
    phone: '988',
    website: 'https://suicidepreventionlifeline.org',
    availability: '24/7',
    type: 'crisis',
    country: 'US'
  },
  {
    id: 'crisis-text',
    name: 'Crisis Text Line',
    description: 'Free, 24/7 support for those in crisis. Text HOME to connect with a counselor.',
    phone: '741741',
    website: 'https://crisistextline.org',
    availability: '24/7',
    type: 'crisis',
    country: 'US'
  },
  {
    id: 'samaritans',
    name: 'Samaritans',
    description: 'Emotional support for anyone in emotional distress, struggling to cope, or at risk of suicide.',
    phone: '116 123',
    website: 'https://samaritans.org',
    availability: '24/7',
    type: 'crisis',
    country: 'UK'
  },
  {
    id: 'befrienders-kenya',
    name: 'Befrienders Kenya',
    description: 'Emotional support and suicide prevention services for anyone in distress.',
    phone: '+254 722 178 177',
    website: 'https://www.facebook.com/BefriendersKenya',
    availability: '24/7',
    type: 'crisis',
    country: 'Kenya'
  },
  {
    id: 'mental-health-kenya',
    name: 'Mental Health Kenya',
    description: 'Free mental health support and counseling services.',
    phone: '+254 20 3000378',
    website: 'https://www.mentalhealthkenya.org',
    availability: 'Mon-Fri 8am-5pm',
    type: 'support',
    country: 'Kenya'
  },
  {
    id: 'inuka-coaches',
    name: 'Inuka Coaches',
    description: 'Professional counseling and mental health support services.',
    phone: '+254 701 163 050',
    website: 'https://www.linkedin.com/company/inuka-coaches',
    availability: 'Mon-Fri 9am-6pm',
    type: 'support',
    country: 'Kenya'
  },
  {
    id: 'usikimye',
    name: 'Usikimye',
    description: 'Mental health awareness and support organization providing counseling services.',
    phone: '+254 794 814 738',
    website: 'https://www.facebook.com/usikimyeke',
    availability: 'Mon-Fri 8am-5pm',
    type: 'support',
    country: 'Kenya'
  },
  {
    id: 'kapc-kenya',
    name: 'Kenya Association of Professional Counsellors',
    description: 'Professional counseling services and mental health support across Kenya.',
    phone: '+254 722 516 799',
    website: 'https://kapc.or.ke',
    availability: 'Mon-Fri 8am-6pm',
    type: 'support',
    country: 'Kenya'
  },
  
  // Support Resources
  {
    id: 'nami',
    name: 'NAMI Support',
    description: 'National Alliance on Mental Illness provides support, education and advocacy.',
    phone: '1-800-950-6264',
    website: 'https://nami.org',
    availability: 'Mon-Fri 10am-10pm ET',
    type: 'support',
    country: 'US'
  },
  {
    id: 'mind',
    name: 'Mind UK',
    description: 'Mental health charity providing advice and support to anyone experiencing mental health problems.',
    phone: '0300 123 3393',
    website: 'https://mind.org.uk',
    availability: 'Mon-Fri 9am-6pm',
    type: 'support',
    country: 'UK'
  },
  
  // Emergency
  {
    id: 'emergency-us',
    name: 'Emergency Services',
    description: 'For immediate life-threatening emergencies.',
    phone: '911',
    availability: '24/7',
    type: 'emergency',
    country: 'US'
  },
  {
    id: 'emergency-uk',
    name: 'Emergency Services',
    description: 'For immediate life-threatening emergencies.',
    phone: '999',
    availability: '24/7',
    type: 'emergency',
    country: 'UK'
  },
  {
    id: 'emergency-kenya',
    name: 'Emergency Services',
    description: 'For immediate life-threatening emergencies.',
    phone: '999 or 911',
    availability: '24/7',
    type: 'emergency',
    country: 'Kenya'
  },
  {
    id: 'kenya-police',
    name: 'Kenya Police',
    description: 'Police emergency services.',
    phone: '999 or 112',
    availability: '24/7',
    type: 'emergency',
    country: 'Kenya'
  }
];

const wellnessTips = [
  {
    title: "Grounding Technique (5-4-3-2-1)",
    description: "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste."
  },
  {
    title: "Deep Breathing",
    description: "Breathe in for 4 counts, hold for 4, exhale for 6. Repeat until you feel calmer."
  },
  {
    title: "Reach Out",
    description: "Contact a trusted friend, family member, or mental health professional."
  },
  {
    title: "Safe Space",
    description: "Go to a place where you feel safe and comfortable, away from stressors."
  },
  {
    title: "Professional Help",
    description: "Don't hesitate to seek professional mental health support when needed."
  },
  {
    title: "Community Support (Harambee Spirit)",
    description: "Reach out to your community, family, or church group. In Kenya, collective support is a source of strength."
  },
  {
    title: "Nature Connection",
    description: "Spend time in Kenya's beautiful nature - visit a park, sit under a tree, or take a walk in your neighborhood."
  },
  {
    title: "Prayer and Meditation",
    description: "If you're spiritual, prayer, meditation, or quiet reflection can provide comfort and peace."
  },
  {
    title: "Traditional Healing",
    description: "Consider combining traditional healing practices with modern mental health support for holistic wellness."
  }
];

export function CrisisSupport() {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'crisis':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'emergency':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'support':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'crisis':
        return <Heart className="h-4 w-4 text-red-600" />;
      case 'emergency':
        return <Shield className="h-4 w-4 text-orange-600" />;
      case 'support':
        return <MessageCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="h-6 w-6 text-primary animate-float" />
          <h2 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Crisis Support & Resources
          </h2>
        </div>
        <p className="text-muted-foreground mb-4">
          You are not alone. Help is available 24/7.
        </p>
        
        {/* Emergency Notice */}
        <Card className="bg-red-50 border-red-200 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
              <Shield className="h-5 w-5" />
              If you are in immediate danger, call emergency services
            </div>
            <div className="flex gap-4 justify-center flex-wrap">
              <Badge className="bg-red-600 hover:bg-red-700 cursor-pointer">
                <Phone className="h-3 w-3 mr-1" />
                US: 911
              </Badge>
              <Badge className="bg-red-600 hover:bg-red-700 cursor-pointer">
                <Phone className="h-3 w-3 mr-1" />
                UK: 999
              </Badge>
              <Badge className="bg-red-600 hover:bg-red-700 cursor-pointer">
                <Phone className="h-3 w-3 mr-1" />
                Kenya: 999/112
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crisis & Support Resources */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground mb-4">Help & Support</h3>
          
          {supportResources.map((resource) => (
            <Card key={resource.id} className="shadow-card bg-gradient-card border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getTypeIcon(resource.type)}
                    {resource.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(resource.type)}>
                      {resource.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {resource.country}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Available: {resource.availability}</span>
                </div>
                
                <div className="flex gap-2">
                  {resource.phone && (
                    <Button asChild className="bg-gradient-hero">
                      <a href={`tel:${resource.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        {resource.phone}
                      </a>
                    </Button>
                  )}
                  
                  {resource.website && (
                    <Button variant="outline" asChild>
                      <a 
                        href={resource.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Immediate Coping Strategies */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground mb-4">Immediate Coping Strategies</h3>
          
          <Card className="shadow-card bg-gradient-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                When You Need Help Right Now
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {wellnessTips.map((tip, index) => (
                <div key={index} className="p-4 border border-accent/30 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">{tip.title}</h4>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Self-Care Reminders */}
          <Card className="shadow-card bg-gradient-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Remember
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-primary font-medium">💙 Your feelings are valid</p>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-primary font-medium">🌟 This difficult moment will pass</p>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-primary font-medium">🤝 Asking for help is a sign of strength</p>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-primary font-medium">🎯 Small steps forward count</p>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-primary font-medium">❤️ You matter and your life has value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Language Support Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-blue-700">
            <strong>Language Support:</strong> Many Kenyan mental health services offer support in Kiswahili, English, and local languages. 
            Don't hesitate to ask for an interpreter or counselor who speaks your preferred language.
          </p>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-accent/20 border-accent/30">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> This app provides general wellness support and is not a substitute for professional medical or mental health treatment. 
            If you are experiencing a mental health crisis, please contact a mental health professional or emergency services immediately.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
