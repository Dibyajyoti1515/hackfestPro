import { Button, Box } from "@mui/material";
import { motion } from "framer-motion";

const MotionButton = motion(Button);

export default function LiquidGlassButton({
    children,
    onClick,
    loading = false
}) {
    return (
        <Box
            sx={{
                position: "relative",
                marginTop: "20px",
                width: "100%",
                display: "flex"
            }}
        >

            <motion.div
                animate={{ opacity: [0.25, 0.4, 0.25] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    inset: "-25%",
                    background: `
                        radial-gradient(
                          circle at top,
                          rgba(37, 99, 235, 0.35),
                          rgba(30, 64, 175, 0.15),
                          transparent 65%
                        )
                    `,
                    filter: "blur(80px)",
                    pointerEvents: "none"
                }}
            />

            <MotionButton
                fullWidth
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                disabled={loading}
                onClick={onClick}
                sx={{
                    position: "relative",
                    zIndex: 2,

                    height: "64px",
                    borderRadius: "999px",
                    paddingX: "48px",

                    fontSize: "1.1rem",
                    fontWeight: 500,
                    letterSpacing: "0.3px",
                    textTransform: "none",

                    color: "#ffffff",
                    "& .MuiButton-label, & .MuiButton-startIcon, & .MuiButton-endIcon": {
                        color: "#ffffff",
                        fill: "#ffffff"
                    },

                    background: "#314586",
                    backdropFilter: "blur(28px) saturate(180%)",
                    WebkitBackdropFilter: "blur(28px) saturate(180%)",

                    border: "1px solid rgba(255,255,255,0.45)",

                    boxShadow: `
        inset 0 1px 1px rgba(255,255,255,0.5),
        inset 0 -6px 14px rgba(0,0,0,0.35),
        0 18px 50px rgba(0,0,0,0.55)
    `,

                    overflow: "hidden",
                    transition: "box-shadow 0.3s ease, border 0.3s ease",

                    "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        background: `
            linear-gradient(
              180deg,
              rgba(255,255,255,0.35),
              rgba(255,255,255,0.12) 30%,
              transparent 60%
            )
        `,
                        pointerEvents: "none"
                    },

                    "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: "-40% -20%",
                        background: `
            linear-gradient(
              120deg,
              transparent 35%,
              rgba(255,255,255,0.35) 45%,
              rgba(255,255,255,0.15) 55%,
              transparent 65%
            )
        `,
                        transform: "translateX(-20%)",
                        pointerEvents: "none"
                    },

                    /* ⚡ Sharp glowing edge on hover */
                    "&:hover": {
                        border: "1px solid rgba(200, 220, 255, 0.35)",
                        color: "#ffffff",
                        boxShadow: `
            inset 0 1px 2px rgba(255, 255, 255, 0.24),
            inset 0 -6px 14px rgba(0,0,0,0.35),
            0 0 18px rgba(160, 200, 255, 0.2),
            0 0 38px rgba(120, 170, 255, 0.21)
        `
                    },

                    "&:active": {
                        transform: "scale(0.98)",
                        color: "#ffffff"
                    },

                    "&:disabled": {
                        opacity: 0.65,
                        color: "#ffffff"
                    }
                }}



            >
                {loading ? "Processing..." : children}
            </MotionButton>
        </Box>
    );
}
