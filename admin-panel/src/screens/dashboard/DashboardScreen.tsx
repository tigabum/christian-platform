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
import api from "../../api/axios";

const DashboardScreen = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          api.get("/admin/dashboard/stats"),
          api.get("/admin/dashboard/activities"),
        ]);
        setStats(statsRes.data);
        setActivities(activitiesRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
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
            value={stats?.totalResponders || 0}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Questions"
            value={stats?.totalQuestions || 0}
            icon={<QuestionIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Answered Questions"
            value={stats?.answeredQuestions || 0}
            icon={<CheckIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Response Rate"
            value={`${stats?.responseRate || 0}%`}
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
