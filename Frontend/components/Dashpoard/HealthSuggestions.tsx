import React, { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown, RefreshCw, Sparkles, Calendar, Heart, TrendingUp, AlertCircle, Clock } from "lucide-react";

const defaultHealthSuggestions = [
  { icon: "🍎", title: "Eat More Fruits", description: "Fruits provide essential vitamins and antioxidants for a healthier life.", category: "nutrition", priority: "medium", timeframe: "daily" },
  { icon: "💧", title: "Stay Hydrated", description: "Drink at least 2 liters of water daily to keep your body refreshed and energized.", category: "hydration", priority: "high", timeframe: "daily" },
  { icon: "🏃", title: "Daily Exercise", description: "Engage in 30 minutes of physical activity to boost cardiovascular health.", category: "exercise", priority: "high", timeframe: "daily" },
  { icon: "😴", title: "Quality Sleep", description: "Maintain 7-8 hours of consistent sleep for better recovery and mental health.", category: "sleep", priority: "high", timeframe: "daily" },
  { icon: "🧘", title: "Practice Mindfulness", description: "10 minutes of meditation daily reduces stress and improves focus.", category: "mental", priority: "medium", timeframe: "daily" },
];

interface HealthSuggestion {
  icon: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  timeframe: string;
}

interface HealthSuggestionsProps {
  userId?: string;
}

const HealthSuggestions: React.FC<HealthSuggestionsProps> = ({ userId = "user@example.com" }) => {
  const [suggestions, setSuggestions] = useState<HealthSuggestion[]>(defaultHealthSuggestions);
  const [selectedMonth, setSelectedMonth] = useState("Jan 2025");
  const [isLoading, setIsLoading] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [summary, setSummary] = useState("");
  const [weeklyInsight, setWeeklyInsight] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const months = [
    "Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", 
    "May 2025", "Jun 2025", "Jul 2025", "Aug 2025",
    "Sep 2025", "Oct 2025", "Nov 2025", "Dec 2025"
  ];

  // Auto-fetch personalized suggestions on component mount
  useEffect(() => {
    fetchPersonalizedSuggestions();
    fetchWeeklyInsights();
  }, [userId]);

  // Auto-refresh suggestions every 24 hours
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPersonalizedSuggestions();
    }, 24 * 60 * 60 * 1000); // 24 hours

    return () => clearInterval(interval);
  }, [selectedMonth, userId]);

  const fetchPersonalizedSuggestions = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://localhost:5000/doctor/health-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: userId,
          month: selectedMonth 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          setIsPersonalized(data.isPersonalized);
          setSummary(data.summary || "");
          setLastUpdated(new Date(data.generatedAt));
        } else {
          throw new Error("No suggestions received");
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching personalized suggestions:", error);
      setError("Failed to load personalized suggestions. Showing general recommendations.");
      setSuggestions(defaultHealthSuggestions);
      setIsPersonalized(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeeklyInsights = async () => {
    try {
      const response = await fetch("http://localhost:5000/doctor/weekly-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.insight) {
          setWeeklyInsight(data.insight);
        }
      }
    } catch (error) {
      console.error("Error fetching weekly insights:", error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      nutrition: "#22c55e",
      hydration: "#3b82f6", 
      exercise: "#f59e0b",
      wellness: "#f97316",
      mental: "#8b5cf6",
      sleep: "#6366f1",
      preventive: "#06b6d4",
      default: "#64748b"
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      nutrition: "🥗",
      hydration: "💧",
      exercise: "💪",
      wellness: "🌟",
      mental: "🧠",
      sleep: "😴",
      preventive: "🛡️",
      default: "✨"
    };
    return icons[category as keyof typeof icons] || icons.default;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "#ef4444",
      medium: "#f59e0b", 
      low: "#22c55e"
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getPriorityIcon = (priority: string) => {
    const icons = {
      high: "🔥",
      medium: "⭐", 
      low: "💡"
    };
    return icons[priority as keyof typeof icons] || icons.medium;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <div style={styles.titleContainer}>
            <Heart size={20} style={{ color: "#e11d48" }} />
            <h2 style={styles.title}>Health Suggestions</h2>
            {isPersonalized && (
              <div style={styles.personalizedBadge}>
                <Sparkles size={12} />
                <span>AI Personalized</span>
              </div>
            )}
          </div>
          <p style={styles.subtitle}>
            {isPersonalized 
              ? "Tailored recommendations based on your health conversations with our AI doctor" 
              : "General wellness tips to improve your daily health"
            }
          </p>
          {lastUpdated && (
            <p style={styles.lastUpdated}>
              <Clock size={12} />
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>

        <div style={styles.headerActions}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button style={styles.dropdownButton}>
                <Calendar size={14} />
                {selectedMonth} 
                <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {months.map((month) => (
                <DropdownMenuItem 
                  key={month} 
                  onSelect={() => setSelectedMonth(month)}
                >
                  {month}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button 
            style={styles.refreshButton}
            onClick={fetchPersonalizedSuggestions}
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "Loading..." : "Get AI Tips"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* AI Summary */}
      {summary && isPersonalized && (
        <div style={styles.summaryCard}>
          <div style={styles.summaryHeader}>
            <TrendingUp size={16} />
            <h3>Your Health Insights</h3>
          </div>
          <p>{summary}</p>
        </div>
      )}

      {/* Weekly Insights */}
      {weeklyInsight && (
        <div style={styles.insightCard}>
          <div style={styles.insightHeader}>
            <Sparkles size={16} />
            <h3>Weekly Health Insight</h3>
          </div>
          <p>{weeklyInsight}</p>
        </div>
      )}

      {/* Suggestions Grid */}
      <div style={styles.suggestionsList}>
        {suggestions.map((item, index) => (
          <div 
            key={index} 
            style={{
              ...styles.suggestionItem,
              background: `linear-gradient(135deg, ${getCategoryColor(item.category)}08, ${getCategoryColor(item.category)}03)`,
              borderLeft: `4px solid ${getPriorityColor(item.priority)}`
            }}
          >
            <div 
              style={{
                ...styles.iconContainer,
                backgroundColor: `${getCategoryColor(item.category)}15`,
                border: `2px solid ${getCategoryColor(item.category)}30`
              }}
            >
              <span style={styles.icon}>{item.icon}</span>
            </div>
            
            <div style={styles.contentContainer}>
              <div style={styles.titleRow}>
                <h3 style={styles.suggestionTitle}>{item.title}</h3>
                <div style={styles.badgeContainer}>
                  <span 
                    style={{
                      ...styles.priorityBadge,
                      backgroundColor: `${getPriorityColor(item.priority)}20`,
                      color: getPriorityColor(item.priority)
                    }}
                  >
                    {getPriorityIcon(item.priority)} {item.priority}
                  </span>
                  <span 
                    style={{
                      ...styles.categoryBadge,
                      backgroundColor: `${getCategoryColor(item.category)}20`,
                      color: getCategoryColor(item.category)
                    }}
                  >
                    {getCategoryIcon(item.category)} {item.category}
                  </span>
                </div>
              </div>
              <p style={styles.suggestionDescription}>{item.description}</p>
              <div style={styles.timeframe}>
                <Clock size={12} />
                <span>Recommended: {item.timeframe}</span>
              </div>
            </div>

            {/* <div style={styles.actionButton}>
              <button 
                style={{
                  ...styles.tryButton,
                  color: getCategoryColor(item.category),
                  backgroundColor: `${getCategoryColor(item.category)}10`,
                  border: `1px solid ${getCategoryColor(item.category)}30`
                }}
              >
                Try It
              </button>
            </div> */}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          💡 Tip: Keep chatting with our AI doctor to get more accurate and personalized health recommendations
        </p>
        {isPersonalized && (
          <p style={styles.footerSubtext}>
            These suggestions are generated based on your recent health conversations and profile
          </p>
        )}
      </div>
    </div>
  );
};

export default HealthSuggestions;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "100%",
    maxWidth: "900px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #f1f5f9",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    gap: "20px",
    flexWrap: "wrap",
  },
  titleSection: {
    flex: 1,
    minWidth: "300px",
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  personalizedBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#8b5cf620",
    color: "#8b5cf6",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    lineHeight: "1.5",
    marginBottom: "4px",
  },
  lastUpdated: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#94a3b8",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  dropdownButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    color: "#475569",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
  },
  refreshButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    border: "1px solid #3b82f6",
    borderRadius: "12px",
    backgroundColor: "#3b82f610",
    fontSize: "14px",
    fontWeight: "500",
    color: "#3b82f6",
    cursor: "pointer",
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    color: "#dc2626",
    fontSize: "14px",
    marginBottom: "16px",
  },
  summaryCard: {
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "1px solid #e2e8f0",
  },
  summaryHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
    color: "#1e293b",
    fontWeight: "600",
  },
  insightCard: {
    padding: "16px",
    backgroundColor: "#fefbf3",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "1px solid #fed7aa",
  },
  insightHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
    color: "#ea580c",
    fontWeight: "600",
  },
  suggestionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  suggestionItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid #f1f5f9",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  iconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    flexShrink: 0,
  },
  icon: {
    fontSize: "24px",
  },
  contentContainer: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "8px",
    gap: "12px",
    flexWrap: "wrap",
  },
  suggestionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
  },
  badgeContainer: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  priorityBadge: {
    fontSize: "11px",
    fontWeight: "500",
    padding: "2px 6px",
    borderRadius: "6px",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },
  categoryBadge: {
    fontSize: "11px",
    fontWeight: "500",
    padding: "2px 6px",
    borderRadius: "6px",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },
  suggestionDescription: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    lineHeight: "1.5",
    marginBottom: "8px",
  },
  timeframe: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#94a3b8",
  },
  actionButton: {
    flexShrink: 0,
  },
  tryButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  footer: {
    marginTop: "24px",
    padding: "16px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    textAlign: "center" as const,
  },
  footerText: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    marginBottom: "4px",
  },
  footerSubtext: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: 0,
    fontStyle: "italic",
  },
};