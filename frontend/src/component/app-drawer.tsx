import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import React from 'react';
import { LoadingSpinner } from './loading-spinner';
import { categories } from '../utility/request';
import { useQuery } from 'urql';

interface Props {
  open: boolean;
  toggle: (
    open: boolean
  ) => (event: React.KeyboardEvent | React.MouseEvent) => void;
}

export const AppDrawer: React.FC<Props> = ({ open, toggle }) => {
  const [res, reexec] = useQuery({
    query: categories,
  });

  if (res.fetching) return <div>loading...</div>;

  if (res.error) {
    console.log(res.error);
    return <div>error</div>;
  }

  return (
    <Drawer
      anchor="left"
      // open={open}
      open={true}
      onClose={toggle(false)}
    >
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={toggle(false)}
        onKeyDown={toggle(false)}
      >
        {res.fetching ? (
          <LoadingSpinner />
        ) : (
          <>
            <List>
              {['Inbox', 'Starred', 'Send email', 'Drafts'].map(
                (text, index) => (
                  <ListItem button key={text}>
                    <ListItemIcon>
                      {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                    </ListItemIcon>
                    <ListItemText primary={text} />
                  </ListItem>
                )
              )}
            </List>
            <Divider />
            <List>
              {['All mail', 'Trash', 'Spam'].map((text, index) => (
                <ListItem button key={text}>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
};
