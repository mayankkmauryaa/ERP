"use client"
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Button } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"

// Reusable Table Component
const ReusableTable = ({ columns, rows, onEdit, onDelete, loading = false }) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead sx={{ backgroundColor: "#1976d2" }}>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id} sx={{ color: "#fff", fontWeight: "bold" }}>
                {col.label}
              </TableCell>
            ))}
            {(onEdit || onDelete) && <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, idx) => (
              <TableRow key={idx} hover>
                {columns.map((col) => (
                  <TableCell key={col.id}>{row[col.id]}</TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {onEdit && (
                        <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => onEdit(row)}>
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => onDelete(row)}
                        >
                          Delete
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ReusableTable
