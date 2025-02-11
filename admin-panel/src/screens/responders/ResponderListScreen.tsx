import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { responderService } from "../../services/responderService";

interface Responder {
  id: string;
  name: string;
  email: string;
  expertise: string;
  status: "active" | "inactive";
  questionsAnswered: number;
  lastActive: string;
}

const ResponderListScreen = () => {
  const [responders, setResponders] = useState<Responder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expertise, setExpertise] = useState("");
  const navigate = useNavigate();

  const loadResponders = async () => {
    try {
      const data = await responderService.getResponders(search, expertise);
      setResponders(data.responders);
    } catch (err) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResponders();
  }, [search, expertise]);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Responders</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/responders/create")}
        >
          Add Responder
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Expertise</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Questions Answered</TableCell>
              <TableCell>Last Active</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {responders.map((responder) => (
              <TableRow key={responder.id}>
                <TableCell>{responder.name}</TableCell>
                <TableCell>{responder.email}</TableCell>
                <TableCell>{responder.expertise}</TableCell>
                <TableCell>
                  <Chip
                    label={responder.status}
                    color={
                      responder.status === "active" ? "success" : "default"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{responder.questionsAnswered}</TableCell>
                <TableCell>
                  {new Date(responder.lastActive).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => navigate(`/responders/${responder.id}`)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ResponderListScreen;
