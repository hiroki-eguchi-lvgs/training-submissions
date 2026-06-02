import { Box } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { QRCodeSVG } from 'qrcode.react';

export interface SimpleDialogProps {
  open: boolean;
  qrCodeSource: string;
  dialogTitle: string;
  onClose: (value: string) => void;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, qrCodeSource, dialogTitle, open } = props;

  const handleClose = () => {
    onClose('');
  };

  const handleListItemClick = (value: string) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <Box
        sx={{
          textAlign: 'center',
        }}
      >
        <QRCodeSVG value={qrCodeSource} />
      </Box>
    </Dialog>
  );
}

export default SimpleDialog;
