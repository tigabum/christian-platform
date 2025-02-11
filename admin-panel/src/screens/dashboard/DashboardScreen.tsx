import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";
import {
  People as PeopleIcon,
  QuestionAnswer as QuestionIcon,
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import StatCard from "./components/StatCard";
import ActivityList from "./components/ActivityList";
import { DashboardStats, RecentActivity } from "../../types/dashboard";
import { dashboardService } from "../../services/dashboardService";
import { Activity } from "../../services/dashboardService";

const DashboardScreen = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalResponders: 0,
    activeResponders: 0,
    totalQuestions: 0,
    answeredQuestions: 0,
    pendingQuestions: 0,
    responseRate: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsData, activitiesData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getActivities(),
        ]);
        setStats(statsData);
        const mappedActivities: RecentActivity[] = activitiesData.map(
          (activity) => ({
            id: activity.id,
            action: activity.type,
            details: activity.title,
            asker: activity.asker,
            responderId: activity.responderId || "",
            responderName: activity.responder || "",
            timestamp: activity.timestamp,
          })
        );
        setActivities(mappedActivities);
      } catch (err: any) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Responders"
            value={stats.totalResponders}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Questions"
            value={stats.totalQuestions}
            icon={<QuestionIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Answered Questions"
            value={stats.answeredQuestions}
            icon={<CheckIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Response Rate"
            value={`${stats.responseRate}%`}
            icon={<TimelineIcon />}
            color="#9c27b0"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <ActivityList activities={activities} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardScreen;
