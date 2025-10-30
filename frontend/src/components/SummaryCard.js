import { Card, CardContent, Typography, Box } from "@mui/material"

// Summary Card Component - displays statistics
const SummaryCard = ({ title, value, icon: Icon, color = "#1976d2" }) => {
  return (
    <Card sx={{ backgroundColor: "#fff", boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {value}
            </Typography>
          </Box>
          {Icon && (
            <Box sx={{ color, fontSize: 40 }}>
              <Icon sx={{ fontSize: 40 }} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default SummaryCard
