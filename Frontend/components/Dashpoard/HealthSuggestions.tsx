import React, { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/button";
import { ChevronDown, RefreshCw, Clock, AlertCircle } from "lucide-react";

interface HealthSuggestion {
  icon: string;
  title: string;
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
  estimatedTime: string;
}

interface HealthSuggestionsResponse {
  suggestions: HealthSuggestion[];
  date: string;
  personalizedMessage: string;
}

const HealthSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<HealthSuggestion[]>([]);
  const [personalizedMessage, setPersonalizedMessage] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchHealthSuggestions = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Get user email from localStorage or session
      const userEmail = localStorage.getItem('userEmail') || 'demo@example.com';
      
      const response = await fetch('http://localhost:5000/api/other/health-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch health suggestions');
      }

      const data: HealthSuggestionsResponse = await response.json();
      setSuggestions(data.suggestions);
      setPersonalizedMessage(data.personalizedMessage);
      setCurrentDate(data.date);
    } catch (err) {
      console.error('Error fetching health suggestions:', err);
      setError('Failed to load personalized suggestions');
      // Fallback to default suggestions
      setSuggestions([
        {
          icon: "🍎",
          title: "Eat More Fruits",
          description: "Include at least 2-3 servings of fresh fruits in your daily diet for essential vitamins and antioxidants.",
          category: "diet",
          priority: "high",
          estimatedTime: "5 minutes"
        },
        {
          icon: "💧",
          title: "Stay Hydrated",
          description: "Drink at least 8-10 glasses of water throughout the day to maintain optimal hydration.",
          category: "lifestyle",
          priority: "high",
          estimatedTime: "Throughout day"
        },
        {
          icon: "🧘",
          title: "Practice Mindfulness",
          description: "Spend 10-15 minutes in meditation or deep breathing exercises to reduce stress.",
          category: "mindfulness",
          priority: "medium",
          estimatedTime: "15 minutes"
        },
        {
          icon: "🚶",
          title: "Take a Walk",
          description: "Go for a 20-30 minute walk in nature to improve circulation and mental well-being.",
          category: "exercise",
          priority: "medium",
          estimatedTime: "30 minutes"
        },
        {
          icon: "🌅",
          title: "Morning Sunlight",
          description: "Get 15-20 minutes of morning sunlight exposure for vitamin D synthesis.",
          category: "lifestyle",
          priority: "low",
          estimatedTime: "20 minutes"
        }
      ]);
      setPersonalizedMessage("Here are your personalized health suggestions for today!");
      setCurrentDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthSuggestions();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'diet': return '#fbbf24';
      case 'exercise': return '#3b82f6';
      case 'lifestyle': return '#8b5cf6';
      case 'mindfulness': return '#06b6d4';
      case 'prevention': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Daily Health Suggestions</h2>
          {personalizedMessage && (
            <p style={styles.subtitle}>{personalizedMessage}</p>
          )}
        </div>

        <div style={styles.headerActions}>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchHealthSuggestions}
            disabled={loading}
            style={styles.refreshButton}
          >
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" style={styles.dropdownButton}>
                {currentDate.split(' ')[0]} {currentDate.split(' ')[1]} <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Today</DropdownMenuItem>
              <DropdownMenuItem>Yesterday</DropdownMenuItem>
              <DropdownMenuItem>This Week</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorContainer}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Suggestions List */}
      <div style={styles.suggestionsList}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Generating personalized suggestions...</span>
          </div>
        ) : (
          suggestions.map((item, index) => (
            <div key={index} style={styles.suggestionItem}>
              <div style={styles.suggestionHeader}>
                <span style={styles.icon}>{item.icon}</span>
                <div style={styles.suggestionInfo}>
                  <h3 style={styles.suggestionTitle}>{item.title}</h3>
                  <p style={styles.suggestionDescription}>{item.description}</p>
                </div>
                <div style={styles.suggestionMeta}>
                  <div 
                    style={{
                      ...styles.priorityBadge,
                      backgroundColor: getPriorityColor(item.priority)
                    }}
                  >
                    {item.priority}
                  </div>
                  <div 
                    style={{
                      ...styles.categoryBadge,
                      backgroundColor: getCategoryColor(item.category)
                    }}
                  >
                    {item.category}
                  </div>
                </div>
              </div>
              <div style={styles.timeContainer}>
                <Clock size={14} />
                <span style={styles.timeText}>{item.estimatedTime}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HealthSuggestions;

const styles: { [key: string]: React.CSSProperties } = {
    container: {
      width: "100%",
      backgroundColor: "#ffffff",
      padding: "24px",
      borderRadius: "16px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "20px",
    },
    title: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#1f2937",
      margin: "0 0 4px 0",
    },
    subtitle: {
      fontSize: "14px",
      color: "#6b7280",
      margin: "0",
      fontStyle: "italic",
    },
    headerActions: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    refreshButton: {
      padding: "8px",
      borderRadius: "8px",
      border: "1px solid #d1d5db",
      backgroundColor: "#ffffff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    dropdownButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      cursor: "pointer",
      backgroundColor: "#ffffff",
      fontSize: "14px",
      fontWeight: "500",
    },
    errorContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px",
      backgroundColor: "#fef2f2",
      border: "1px solid #fecaca",
      borderRadius: "8px",
      color: "#dc2626",
      fontSize: "14px",
      marginBottom: "16px",
    },
    loadingContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      padding: "40px",
      color: "#6b7280",
      fontSize: "16px",
    },
    suggestionsList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    suggestionItem: {
      backgroundColor: "#f9fafb",
      borderRadius: "12px",
      padding: "16px",
      border: "1px solid #e5e7eb",
      transition: "all 0.2s ease-in-out",
      cursor: "pointer",
    },
    suggestionHeader: {
      display: "flex",
      alignItems: "flex-start",
      gap: "16px",
      marginBottom: "12px",
    },
    icon: {
      fontSize: "28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "40px",
      minHeight: "40px",
      backgroundColor: "#ffffff",
      borderRadius: "10px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    suggestionInfo: {
      flex: 1,
    },
    suggestionTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#1f2937",
      margin: "0 0 6px 0",
    },
    suggestionDescription: {
      fontSize: "14px",
      color: "#6b7280",
      lineHeight: "1.5",
      margin: "0",
    },
    suggestionMeta: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      alignItems: "flex-end",
    },
    priorityBadge: {
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "600",
      color: "#ffffff",
      textTransform: "uppercase",
    },
    categoryBadge: {
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "500",
      color: "#ffffff",
      textTransform: "capitalize",
    },
    timeContainer: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      color: "#6b7280",
      fontSize: "13px",
      fontWeight: "500",
    },
    timeText: {
      fontSize: "13px",
    },
  };