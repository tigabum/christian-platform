import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
} from "@mui/material";
import { QuestionAnswer, Login, SwapHoriz } from "@mui/icons-material";
import { RecentActivity } from "../../../types/dashboard";
import { formatDistanceToNow } from "date-fns";

interface ActivityListProps {
  activities: RecentActivity[];
}

const ActivityList: React.FC<ActivityListProps> = ({ activities }) => {
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "answer":
        return <QuestionAnswer />;
      case "login":
        return <Login />;
      case "status_change":
        return <SwapHoriz />;
      default:
        return <QuestionAnswer />;
    }
  };

  return (
    <List>
      {activities.map((activity) => (
        <ListItem key={activity.id}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {getActivityIcon(activity.action)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={activity.details}
            secondary={
              <Typography variant="body2" color="text.secondary">
                {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                })}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ActivityList;
