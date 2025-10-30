import { Box, CircularProgress, Typography } from "@mui/material"

// Loader Component - displays loading spinner
const Loader = ({ message = "Loading..." }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  )
}

export default Loader
