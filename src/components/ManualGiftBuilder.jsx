import { useState } from "react";
import {
    Box,
    TextField,
    Slider,
    Button,
    Typography,
    Chip,
    Select,
    MenuItem,
    IconButton,
    Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const COLOR_OPTIONS = [
    "black", "white", "grey", "navy",
    "cream", "beige", "amber", "silver", "wood", "charcoal"
];

export default function ManualGiftBuilder({ onGenerate }) {

    const [products, setProducts] = useState([
        { name: "", colors: [] }
    ]);

    const [price, setPrice] = useState([1500, 8000]);
    const [rating, setRating] = useState(4);
    const [discount, setDiscount] = useState(15);
    const [limit, setLimit] = useState(6);

    const addProduct = () => {
        setProducts(prev => [...prev, { name: "", colors: [] }]);
    };

    const updateProduct = (index, field, value) => {
        const clone = [...products];
        clone[index][field] = value;
        setProducts(clone);
    };

    const buildPayload = () => ({
        product: products.map(p => p.name).filter(Boolean),
        price: { min: price[0], max: price[1] },
        rating: { min: rating },
        discount: { min: discount },
        brand: [],
        color: products.map(p => p.colors),
        availability: "in_stock",
        sortBy: "price_low_to_high",
        limit
    });

    const glassCard = {
        background:
            "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: "18px",
        padding: 2,
        color: "#fff"
    };

    const whiteField = {
        "& .MuiOutlinedInput-root": {
            color: "#fff",
            "& fieldset": {
                borderColor: "rgba(255,255,255,0.35)"
            },
            "&:hover fieldset": {
                borderColor: "#7dd3fc"
            },
            "&.Mui-focused fieldset": {
                borderColor: "#38bdf8",
                boxShadow: "0 0 12px rgba(56,189,248,0.6)"
            }
        },
        "& .MuiInputLabel-root": {
            color: "#fff"
        }
    };

    return (
        <Box sx={{ ...glassCard, display: "flex", flexDirection: "column", gap: 3 }}>

            {/* ⭐ Rating Header */}
            <Box>
                <Typography fontWeight={700}>
                    Minimum Rating: {rating}
                </Typography>
                <Slider
                    value={rating}
                    min={1}
                    max={5}
                    step={0.5}
                    onChange={(e, v) => setRating(v)}
                    valueLabelDisplay="auto"
                    sx={{
                        color: "#7dd3fc",
                        "& .MuiSlider-thumb": {
                            boxShadow: "0 0 12px rgba(125,211,252,0.9)"
                        }
                    }}
                />
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.15)" }} />

            {/* 🧩 Main Grid */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr",
                    gap: 3
                }}
            >

                {/* 🟦 LEFT PANEL */}
                <Box
                    sx={{
                        maxHeight: 360,
                        overflowY: "auto",
                        pr: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,

                        /* 🌊 Glass Scrollbar */
                        "&::-webkit-scrollbar": {
                            width: 6
                        },
                        "&::-webkit-scrollbar-track": {
                            background: "rgba(255,255,255,0.06)",
                            borderRadius: 10
                        },
                        "&::-webkit-scrollbar-thumb": {
                            background: "rgba(255,255,255,0.35)",
                            borderRadius: 10,
                            backdropFilter: "blur(6px)"
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                            background: "rgba(125,211,252,0.6)"
                        }
                    }}
                >

                    <Typography fontWeight={700}>Products</Typography>

                    {products.map((item, index) => (
                        <Box key={index} sx={{ ...glassCard }}>

                            <TextField
                                fullWidth
                                label={`Product ${index + 1}`}
                                placeholder="luxury soft throw blanket"
                                value={item.name}
                                onChange={e =>
                                    updateProduct(index, "name", e.target.value)
                                }
                                sx={whiteField}
                            />

                            <Select
                                multiple
                                fullWidth
                                value={item.colors}
                                sx={{
                                    mt: 2,
                                    color: "#fff",
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "rgba(255,255,255,0.35)"
                                    }
                                }}
                                onChange={e =>
                                    updateProduct(index, "colors", e.target.value)
                                }
                                renderValue={(selected) => (
                                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                        {selected.map(color => (
                                            <Chip
                                                key={color}
                                                label={color}
                                                size="small"
                                                sx={{
                                                    background: "rgba(255,255,255,0.18)",
                                                    color: "#fff",
                                                    backdropFilter: "blur(6px)"
                                                }}
                                            />
                                        ))}
                                    </Box>
                                )}
                            >
                                {COLOR_OPTIONS.map(color => (
                                    <MenuItem
                                        key={color}
                                        value={color}
                                        sx={{
                                            backgroundColor: "#020617",
                                            color: "#fff",
                                            "&:hover": { backgroundColor: "#020617" }
                                        }}
                                    >
                                        {color}
                                    </MenuItem>
                                ))}
                            </Select>

                        </Box>
                    ))}

                    {/* ➕ Add Product */}
                    <IconButton
                        onClick={addProduct}
                        sx={{
                            width: 46,
                            height: 46,
                            alignSelf: "flex-start",
                            background: "rgba(255,255,255,0.12)",
                            border: "1px solid rgba(255,255,255,0.25)",
                            color: "#fff",
                            "&:hover": {
                                background: "rgba(125,211,252,0.2)",
                                boxShadow: "0 0 18px rgba(125,211,252,0.6)"
                            }
                        }}
                    >
                        <AddIcon />
                    </IconButton>

                </Box>

                {/* 🟪 RIGHT PANEL */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

                    {/* 💰 Price */}
                    <Box sx={glassCard}>
                        <Typography fontWeight={600}>
                            Price Range (₹{price[0]} – ₹{price[1]})
                        </Typography>
                        <Slider
                            value={price}
                            min={500}
                            max={20000}
                            onChange={(e, v) => setPrice(v)}
                            valueLabelDisplay="auto"
                            sx={{
                                color: "#a78bfa",
                                "& .MuiSlider-thumb": {
                                    boxShadow: "0 0 12px rgba(167,139,250,0.9)"
                                }
                            }}
                        />
                    </Box>

                    {/* 🔥 Discount */}
                    <Box sx={glassCard}>
                        <Typography fontWeight={600}>
                            Minimum Discount: {discount}%
                        </Typography>
                        <Slider
                            value={discount}
                            min={0}
                            max={70}
                            onChange={(e, v) => setDiscount(v)}
                            valueLabelDisplay="auto"
                            sx={{
                                color: "#f472b6",
                                "& .MuiSlider-thumb": {
                                    boxShadow: "0 0 12px rgba(244,114,182,0.9)"
                                }
                            }}
                        />
                    </Box>

                    {/* 📦 Limit */}
                    <Box sx={glassCard}>
                        <TextField
                            fullWidth
                            label="Result Limit"
                            type="number"
                            value={limit}
                            onChange={e => setLimit(Number(e.target.value))}
                            sx={whiteField}
                        />
                    </Box>

                </Box>
            </Box>

            {/* 🚀 Generate Button */}
            <Button
                fullWidth
                size="large"
                onClick={() => onGenerate(buildPayload())}
                sx={{
                    mt: 2,
                    height: 56,
                    color: "#fff",
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    borderRadius: "16px",
                    background:
                        "linear-gradient(135deg, #38bdf8, #6366f1)",
                    boxShadow: "0 12px 40px rgba(56,189,248,0.7)",
                    textTransform: "none",
                    "&:hover": {
                        filter: "brightness(1.15)",
                        boxShadow: "0 18px 60px rgba(99,102,241,0.9)"
                    }
                }}
            >
                Generate Manual Gifts
            </Button>

        </Box>
    );
}
