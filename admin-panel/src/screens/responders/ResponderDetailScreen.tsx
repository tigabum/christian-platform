import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { responderService } from "../../services/responderService";
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

const ResponderDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    expertise: "",
    password: "", // Optional for updates
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResponder = async () => {
      try {
        if (!id) return;
        const responder = await responderService.getResponder(id);
        setFormData({
          name: responder.name,
          email: responder.email,
          expertise: responder.expertise,
          password: "", // Empty as we don't receive password
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load responder");
      } finally {
        setLoading(false);
      }
    };

    loadResponder();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!id) return;

      // Only send password if it's been changed
      const updateData = {
        ...formData,
        password: formData.password || undefined,
      };

      await responderService.updateResponder(id, updateData);
      navigate("/responders");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update responder");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Edit Responder
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
                label="Expertise"
                name="expertise"
                value={formData.expertise}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                helperText="Leave empty to keep current password"
              />
            </Grid>

            <Grid item xs={12} sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                type="submit"
                size="large"
                disabled={loading}
              >
                Update Responder
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

export default ResponderDetailScreen;
