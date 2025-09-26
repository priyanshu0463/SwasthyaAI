import React, { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";
import { ChevronDown, RefreshCw, Sparkles, Calendar, Heart } from "lucide-react";
import { Button } from "@radix-ui/themes/dist/cjs/components/button";

const defaultHealthSuggestions = [
  { icon: "🍎", title: "Eat More Fruits", description: "Fruits provide essential vitamins and antioxidants for a healthier life.", category: "nutrition" },
  { icon: "🥤", title: "Stay Hydrated", description: "Drink at least 2 liters of water daily to keep your body refreshed and energized.", category: "hydration" },
  { icon: "🏃", title: "Daily Jogging", description: "Jogging for 30 minutes boosts heart health, stamina, and mental clarity.", category: "exercise" },
  { icon: "☀️", title: "Get Sunlight Exposure", description: "Morning sunlight helps in vitamin D production and improves mood.", category: "wellness" },
  { icon: "🧘", title: "Practice Mindfulness", description: "10 minutes of meditation daily reduces stress and improves focus.", category: "mental" },
];

interface HealthSuggestionsProps {
  userId?: string;
}

const HealthSuggestions: React.FC<HealthSuggestionsProps> = ({ userId = "pk" }) => {
  const [suggestions, setSuggestions] = useState(defaultHealthSuggestions);
  const [selectedMonth, setSelectedMonth] = useState("Jan 2025");
  const [isLoading, setIsLoading] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);

  const months = [
    "Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025", 
    "May 2025", "Jun 2025", "Jul 2025", "Aug 2025"
  ];

  const fetchPersonalizedSuggestions = async () => {
    setIsLoading(true);
    try {
      // Call your backend to get personalized suggestions based on chat history
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
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
          setIsPersonalized(true);
        }
      }
    } catch (error) {
      console.error("Error fetching personalized suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      nutrition: "#22c55e",
      hydration: "#3b82f6", 
      exercise: "#f59e0b",
      wellness: "#f97316",
      mental: "#8b5cf6",
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
      default: "✨"
    };
    return icons[category as keyof typeof icons] || icons.default;
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
              ? "Tailored recommendations based on your health conversations" 
              : "General wellness tips to improve your daily health"
            }
          </p>
        </div>

        <div style={styles.headerActions}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" style={styles.dropdownButton}>
                <Calendar size={14} />
                {selectedMonth} 
                <ChevronDown size={14} />
              </Button>
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

          <Button 
            variant="outline" 
            style={styles.refreshButton}
            onClick={fetchPersonalizedSuggestions}
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            {isLoading ? "Loading..." : "Get AI Tips"}
          </Button>
        </div>
      </div>

      {/* Suggestions Grid */}
      <div style={styles.suggestionsList}>
        {suggestions.map((item, index) => (
          <div 
            key={index} 
            style={{
              ...styles.suggestionItem,
              background: `linear-gradient(135deg, ${getCategoryColor(item.category)}08, ${getCategoryColor(item.category)}03)`
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
              <p style={styles.suggestionDescription}>{item.description}</p>
            </div>

            <div style={styles.actionButton}>
              <Button 
                variant="ghost" 
                size="sm"
                style={{
                  color: getCategoryColor(item.category),
                  backgroundColor: `${getCategoryColor(item.category)}10`
                }}
              >
                Try It
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          💡 Tip: Chat with our AI doctor to get more personalized health recommendations
        </p>
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
  },
  titleSection: {
    flex: 1,
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px",
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
  },
  headerActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
    gap: "12px",
  },
  suggestionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
  },
  categoryBadge: {
    fontSize: "12px",
    fontWeight: "500",
    padding: "4px 8px",
    borderRadius: "8px",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },
  suggestionDescription: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    lineHeight: "1.5",
  },
  actionButton: {
    flexShrink: 0,
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
  },
};