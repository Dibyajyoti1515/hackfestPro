import { TextField, Box } from "@mui/material";
import { motion, useAnimation } from "framer-motion";

const MotionBox = motion(Box);

export default function GlassInput({
    label,
    placeholder,
    value,
    onChange,
    icon
}) {
    const glowControls = useAnimation();

    const handleFocus = () => {
        glowControls.start({
            opacity: 1,
            scale: 1.02,
            transition: { duration: 0.35 }
        });
    };

    const handleBlur = () => {
        glowControls.start({
            opacity: 0,
            scale: 1,
            transition: { duration: 0.35 }
        });
    };

    return (
        <MotionBox
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            sx={{
                position: "relative",
                borderRadius: "18px",
                padding: "10px",
                width: {
                    xs: "100%",
                    sm: "100%",
                    md: "97%"
                },
                margin: {
                    xs: "0.5rem",
                    md: "1rem"
                },
                background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.10)",   // thin border stays thin
                backdropFilter: "blur(18px) saturate(150%)",
                WebkitBackdropFilter: "blur(18px) saturate(150%)",
                boxShadow:
                    "0 14px 46px rgba(2,6,23,0.75), inset 0 1px 0 rgba(255,255,255,0.05)",
                overflow: "hidden"
            }}
        >
            <motion.div
                animate={glowControls}
                initial={{ opacity: 0, scale: 1 }}
                style={{
                    position: "absolute",
                    inset: "-35%",
                    borderRadius: "50%",
                    pointerEvents: "none",
                    background: `
            radial-gradient(
              ellipse at top,
              rgba(125,140,255,0.45) 0%,
              rgba(99,102,241,0.35) 20%,
              rgba(99,102,241,0.18) 40%,
              rgba(99,102,241,0.08) 55%,
              transparent 70%
            )
          `,
                    filter: "blur(40px)"
                }}
            />

            <TextField
                fullWidth
                variant="outlined"
                label={`${icon || ""} ${label}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                InputLabelProps={{ shrink: true }}
                sx={{
                    position: "relative",
                    zIndex: 2,

                    "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        background:
                            "linear-gradient(180deg, rgba(3,7,30,0.68), rgba(2,6,23,0.48))",
                        color: "#ffffff",
                        fontSize: "1.1rem",
                        fontWeight: 500,
                        letterSpacing: "0.3px",
                        backdropFilter: "blur(6px)",
                        transition: "all 0.25s ease"
                    },

                    "& input:-webkit-autofill": {
                        WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                        WebkitTextFillColor: "#eaf0ff",
                        caretColor: "#a5b4fc",
                        transition: "background-color 9999s ease-out"
                    },

                    "& .MuiOutlinedInput-input": {
                        background: "transparent !important",
                        padding: "18px 16px",
                        fontSize: "1.1rem"
                    },

                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.12)"
                    },

                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.20)"
                    },

                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(150,170,255,0.9)",
                        borderWidth: "1px"
                    },

                    "& .MuiInputLabel-root": {
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "1rem",
                        letterSpacing: "0.4px"
                    },

                    "& .MuiInputLabel-root.Mui-focused": {
                        color: "#c7d2fe"
                    },

                    "& input::placeholder": {
                        color: "rgba(255,255,255,0.65)",
                        opacity: 1
                    }
                }}
            />
        </MotionBox>
    );
}
