import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { searchUsers } from '../store/meetingsSlice';

function ParticipantSelector({ value = [], onChange, disabled = false }) {
  const dispatch = useDispatch();
  const { userSearchResults, userSearchLoading } = useSelector(
    (state) => state.meetings
  );
  const [inputValue, setInputValue] = useState('');
  const debounceRef = useRef(null);

  const selectedIds = value.map((u) => u._id);

  const filteredOptions = userSearchResults.filter(
    (u) => !selectedIds.includes(u._id)
  );

  const handleInputChange = useCallback(
    (_event, newValue) => {
      setInputValue(newValue);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (newValue.trim().length > 0) {
        debounceRef.current = setTimeout(() => {
          dispatch(searchUsers(newValue.trim()));
        }, 300);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <Box>
      <Autocomplete
        multiple
        disabled={disabled}
        options={filteredOptions}
        getOptionLabel={(option) => option.name || option.email}
        isOptionEqualToValue={(option, val) => option._id === val._id}
        value={value}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={(_event, newValue) => onChange(newValue)}
        loading={userSearchLoading}
        filterOptions={(x) => x}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Partecipanti"
            placeholder="Cerca utenti..."
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {userSearchLoading && <CircularProgress size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option._id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={option.photo} sx={{ width: 32, height: 32 }}>
              {option.name?.[0]}
            </Avatar>
            <Box>
              <Typography variant="body2">{option.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {option.email}
              </Typography>
            </Box>
          </Box>
        )}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const { key, ...chipProps } = getTagProps({ index });
            return (
              <Chip
                key={key}
                avatar={<Avatar src={option.photo}>{option.name?.[0]}</Avatar>}
                label={option.name}
                {...chipProps}
              />
            );
          })
        }
      />
    </Box>
  );
}

export default ParticipantSelector;
