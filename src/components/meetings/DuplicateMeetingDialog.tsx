import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { useEffect, useState } from "react";

import type { Meeting } from "../../types/meetings";
import { formatDate } from "../../utils/meetings";

export default function DuplicateMeetingDialog({
  open,
  meeting,
  committees,
  onClose,
  onDuplicate,
}: {
  open: boolean;
  meeting: Meeting | null;
  committees: string[];
  onClose: () => void;
  onDuplicate: (meeting: Meeting) => void;
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [committee, setCommittee] = useState("");

  useEffect(() => {
    if (open && meeting) {
      setName(meeting.name);
      setDate(null);
      setCommittee(meeting.committee);
    }
  }, [open, meeting]);

  if (!meeting) return null;

  const handleDuplicate = () => {
    if (!date) return;
    onDuplicate({
      ...meeting,
      id: `m-dup-${Date.now()}`,
      name: name || meeting.name,
      date: format(date, "yyyy-MM-dd"),
      committee,
      status: "Draft",
      visibility: "Internal",
      agendaStatus: "Not published",
    });
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle
          component="div"
          sx={{
            fontSize: "20px",
            fontWeight: 600,
            lineHeight: "24px",
            letterSpacing: 0,
            color: "var(--lens-semantic-color-type-default)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
            pb: "24px",
          }}
        >
          Duplicate meeting
          <IconButton aria-label="Close" size="small" onClick={onClose} sx={{ flexShrink: 0, mt: "-2px", mr: "-4px" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Source: {formatDate(meeting.date)} — {meeting.name}
          </Alert>
          <Stack gap={2}>
            <FormControl fullWidth>
              <FormLabel>New name</FormLabel>
              <TextField
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
            </FormControl>
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <FormLabel>New date</FormLabel>
                <DatePicker
                  value={date}
                  onChange={(val) => setDate(val)}
                  slotProps={{
                    textField: { fullWidth: true, placeholder: "MM/DD/YYYY" },
                  }}
                />
              </FormControl>
              <FormControl fullWidth>
                <FormLabel>Target committee</FormLabel>
                <Select
                  value={committee}
                  onChange={(e) => setCommittee(e.target.value)}
                >
                  {committees.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
          <Button variant="outlined" size="medium" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="medium"
            onClick={handleDuplicate}
            disabled={!date}
          >
            Duplicate
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
