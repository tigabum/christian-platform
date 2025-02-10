import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

interface ResponderDetail {
  id: string;
  name: string;
  email: string;
  expertise: string;
  status: "active" | "inactive";
  questionsAnswered: number;
  lastActive: string;
}

const EXPERTISE_OPTIONS = [
  "Biblical Studies",
  "Theology",
  "Church History",
  "Pastoral Care",
  "Ethics",
];

const ResponderDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [responder, setResponder] = useState<ResponderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadResponder();
  }, [id]);

  const loadResponder = async () => {
    try {
      const response = await api.get(`/admin/responders/${id}`);
      setResponder(response.data);
    } catch (error: any) {
      setError("Failed to load responder details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/admin/responders/${id}`, responder);
      setIsEditing(false);
      loadResponder();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update responder");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (responder) {
      setResponder({
        ...responder,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (responder) {
      setResponder({
        ...responder,
        status: e.target.checked ? "active" : "inactive",
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!responder) return <div>Responder not found</div>;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Responder Details</Typography>
        <Button variant="contained" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel Edit" : "Edit Details"}
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={responder.name}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={responder.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Expertise"
              name="expertise"
              value={responder.expertise}
              onChange={handleChange}
              disabled={!isEditing}
            >
              {EXPERTISE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={responder.status === "active"}
                  onChange={handleStatusChange}
                  disabled={!isEditing}
                />
              }
              label="Active Status"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Questions Answered: {responder.questionsAnswered}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Last Active: {new Date(responder.lastActive).toLocaleString()}
            </Typography>
          </Grid>

          {isEditing && (
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={handleUpdate} sx={{ mr: 2 }}>
                Save Changes
              </Button>
              <Button variant="outlined" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ResponderDetailScreen;
