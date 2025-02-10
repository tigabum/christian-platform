import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

interface ResponderFormData {
  name: string;
  email: string;
  expertise: string;
  password: string;
}

const EXPERTISE_OPTIONS = [
  "Biblical Studies",
  "Theology",
  "Church History",
  "Pastoral Care",
  "Ethics",
];

const ResponderCreateScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ResponderFormData>({
    name: "",
    email: "",
    expertise: "",
    password: "",
  });
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/responders", formData);
      navigate("/responders");
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create responder");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create Responder
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Expertise"
                name="expertise"
                value={formData.expertise}
                onChange={handleChange}
                required
              >
                {EXPERTISE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Initial Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                helperText="Responder will be required to change this on first login"
              />
            </Grid>

            <Grid item xs={12} sx={{ display: "flex", gap: 2 }}>
              <Button variant="contained" type="submit" size="large">
                Create Responder
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/responders")}
                size="large"
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ResponderCreateScreen;
