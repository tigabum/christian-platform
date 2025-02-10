import React from "react";
import { Paper, Box, Typography } from "@mui/material";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1,
          bgcolor: `${color}15`,
          color: color,
          display: "flex",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5">{value}</Typography>
      </Box>
    </Paper>
  );
};

export default StatCard;
