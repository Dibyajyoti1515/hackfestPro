import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider
} from "@mui/material";

export default function ProductPage() {
  const { state: gift } = useLocation();
  const navigate = useNavigate();

  if (!gift) {
    return (
      <Box sx={{ color: "#fff", textAlign: "center", mt: 10 }}>
        <Typography variant="h5">Product not found</Typography>
        <Button onClick={() => navigate("/")}>Go Back</Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        padding: 4,
        background:
          "radial-gradient(circle at top, #11162a, #05070f)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ width: "100%", maxWidth: 1200 }}
      >
        {/* 🧊 Main Glass Container */}
        <Box
          sx={{
            borderRadius: "28px",
            padding: 4,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))",
            backdropFilter: "blur(22px)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow:
              "0 40px 120px rgba(0,0,0,0.6)",
          }}
        >
          {/* 🖼️ Top Section */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
          >
            {/* Image */}
            <motion.div whileHover={{ scale: 1.05 }}>
              <Box
                component="img"
                src={gift.image?.highRes || gift.image?.thumbnail}
                alt={gift.name}
                sx={{
                  width: { xs: "100%", md: 420 },
                  height: 420,
                  objectFit: "contain",
                  borderRadius: "22px",
                  padding: 2,
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))",
                }}
              />
            </motion.div>

            {/* Info */}
            <Stack spacing={2} flex={1}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#fff" }}
              >
                {gift.name}
              </Typography>

              <Typography
                variant="h5"
                sx={{ color: "#9fd0ff", fontWeight: 600 }}
              >
                {gift.price}
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button
                  href={gift.url}
                  target="_blank"
                  variant="contained"
                  sx={{
                    borderRadius: "999px",
                    px: 4,
                    background:
                      "linear-gradient(135deg, #6fb1ff, #9c6bff)",
                    boxShadow:
                      "0 12px 40px rgba(140,120,255,0.6)"
                  }}
                >
                  Buy on Amazon
                </Button>

                <Button
                  onClick={() => navigate(-1)}
                  sx={{
                    borderRadius: "999px",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.3)"
                  }}
                >
                  ← Back
                </Button>
              </Stack>
            </Stack>
          </Stack>

          <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.2)" }} />

          {/* 📋 About Section */}
          <Typography
            variant="h5"
            sx={{ color: "#fff", mb: 2 }}
          >
            Product Details
          </Typography>

          {gift.about?.length > 0 ? (
            <Stack spacing={1}>
              {gift.about.map((item, index) => (
                <Typography
                  key={index}
                  sx={{ color: "rgba(255,255,255,0.85)" }}
                >
                  • {item}
                </Typography>
              ))}
            </Stack>
          ) : (
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
              No detailed description available.
            </Typography>
          )}

          <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.2)" }} />

          {/* ⭐ Reviews Section */}
          <Typography
            variant="h5"
            sx={{ color: "#fff", mb: 2 }}
          >
            Customer Reviews
          </Typography>

          <Box
            sx={{
              maxHeight: 260,
              overflowY: "auto",
              paddingRight: 1,

              /* 🌊 Scrollbar Styling */
              "&::-webkit-scrollbar": {
                width: "8px"
              },

              "&::-webkit-scrollbar-track": {
                background: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                backdropFilter: "blur(6px)"
              },

              "&::-webkit-scrollbar-thumb": {
                borderRadius: "12px",
                background:
                  "linear-gradient(180deg, rgba(120,180,255,0.8), rgba(160,120,255,0.8))",
                boxShadow: "0 0 12px rgba(140,160,255,0.8)"
              },

              "&::-webkit-scrollbar-thumb:hover": {
                background:
                  "linear-gradient(180deg, rgba(140,200,255,1), rgba(190,150,255,1))"
              }
            }}
          >

            <Stack spacing={2}>
              {gift.reviews?.length > 0 ? (
                gift.reviews.map((review, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Box
                      sx={{
                        padding: 2,
                        borderRadius: "16px",
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                        backdropFilter: "blur(10px)",
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "0.95rem"
                      }}
                    >
                      ⭐ {review}
                    </Box>
                  </motion.div>
                ))
              ) : (
                <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
                  No reviews available.
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}
