
import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import PauseRounded from '@mui/icons-material/PauseRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import FastForwardRounded from '@mui/icons-material/FastForwardRounded';
import FastRewindRounded from '@mui/icons-material/FastRewindRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import VolumeDownRounded from '@mui/icons-material/VolumeDownRounded';
import { Button } from '@mui/material';

const WallPaper = styled('div')({
    position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, overflow: 'hidden',
    background: 'linear-gradient(rgb(255, 38, 142) 0%, rgb(255, 105, 79) 100%)',
    transition: 'all 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275) 0s',
    '&:before': {
        content: '""', width: '140%', height: '140%', position: 'absolute', top: '-40%', right: '-50%',
        background: 'radial-gradient(at center center, rgb(62, 79, 249) 0%, rgba(62, 79, 249, 0) 64%)',
    },
    '&:after': {
        content: '""', width: '140%', height: '140%', position: 'absolute', bottom: '-50%', left: '-30%',
        background: 'radial-gradient(at center center, rgb(247, 237, 225) 0%, rgba(247, 237, 225, 0) 70%)', transform: 'rotate(30deg)',
    },
});

const Widget = styled('div')(({ theme }) => ({
    padding: 16, borderRadius: 16, width: 343, maxWidth: '100%', margin: 'auto', position: 'relative', zIndex: 1,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)', backdropFilter: 'blur(40px)',
}));

const CoverImage = styled('div')({
    width: 100, height: 100, objectFit: 'cover', overflow: 'hidden', flexShrink: 0, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.08)', '& > img': { width: '100%', },
});

const TinyText = styled(Typography)({ fontSize: '0.75rem', opacity: 0.38, fontWeight: 500, letterSpacing: 0.2, });

export const MusicPlayerSlider = () => {
    const theme = useTheme();
    const duration = 200; // seconds
    const [position, setPosition] = React.useState(32);
    const [paused, setPaused] = React.useState(false);
    function formatDuration(value: number) {
        const minute = Math.floor(value / 60);
        const secondLeft = value - minute * 60;
        return `${minute}:${secondLeft < 9 ? `0${secondLeft}` : secondLeft}`;
    }
    const [volume, SetVolume] = React.useState(0.5);
    const mainIconColor = theme.palette.mode === 'dark' ? '#fff' : '#000';
    const lightIconColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
    const Introduction = <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CoverImage>        <img alt="can't win - Chilling Sunday" src="/static/images/sliders/chilling-sunday.jpg" />    </CoverImage>
        <Box sx={{ ml: 1.5, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>                Jun Pulse            </Typography>
            <Typography noWrap> <b>คนเก่าเขาทำไว้ดี (Can&apos;t win)</b>            </Typography>
            <Typography noWrap letterSpacing={-0.25}> Chilling Sunday &mdash; คนเก่าเขาทำไว้ดี </Typography>
        </Box>
    </Box>
    const SliderPanel = <Slider aria-label="time-indicator" size="small" value={position} min={0} step={1}
        max={duration} onChange={(_, value) => setPosition(value as number)}
        sx={{
            color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
            height: 4,
            '& .MuiSlider-thumb': {
                width: 8, height: 8, transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                '&:before': { boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)', },
                '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0px 0px 0px 8px ${theme.palette.mode === 'dark'
                        ? 'rgb(255 255 255 / 16%)'
                        : 'rgb(0 0 0 / 16%)'
                        }`,
                },
                '&.Mui-active': { width: 20, height: 20, },
            },
            '& .MuiSlider-rail': { opacity: 0.28, },
        }}
    />
    const VolumePanel = <Stack spacing={2} direction="row" sx={{ mb: 1, px: 1 }} alignItems="center">
        <VolumeDownRounded htmlColor={lightIconColor} />
        <Slider aria-label="Volume" defaultValue={30} sx={{
            color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
            '& .MuiSlider-track': { border: 'none', },
            '& .MuiSlider-thumb': {
                width: 24, height: 24, backgroundColor: '#fff',
                '&:before': { boxShadow: '0 4px 8px rgba(0,0,0,0.4)', },
                '&:hover, &.Mui-focusVisible, &.Mui-active': { boxShadow: 'none', },
            },
        }}
        />
        <VolumeUpRounded htmlColor={lightIconColor} />
    </Stack>
    
    return <Box sx={{ width: '50%',height:250, overflow: 'hidden' }}>
        <Widget>
            {Introduction}
            {SliderPanel}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: -2, }} >
                <TinyText>{formatDuration(position)}</TinyText>
                <TinyText>-{formatDuration(duration - position)}</TinyText>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: -1, }} >
                <IconButton aria-label="previous song"> <FastRewindRounded fontSize="large" htmlColor={mainIconColor} /> </IconButton>
                <IconButton aria-label={paused ? 'play' : 'pause'} onClick={() => setPaused(!paused)} >
                    {paused ? <PlayArrowRounded sx={{ fontSize: '3rem' }} htmlColor={mainIconColor} />
                        : <PauseRounded sx={{ fontSize: '3rem' }} htmlColor={mainIconColor} />
                    }
                </IconButton>
                <IconButton aria-label="next song"> <FastForwardRounded fontSize="large" htmlColor={mainIconColor} /> </IconButton>
            </Box>

            {VolumePanel}
        </Widget>
        <WallPaper />
    </Box>

}



export const base64EncodedMp3 = "data:audio/mpeg;base64,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OigKA5iix0v4Miz6wiVO88MvicqgLpk/C45DGadgqTJPdcFNjy7U17QfqKSkFdOJbk+zQvBO4xEu2YOyD9C3//tUZOcA8n4bzut5MFgAAA0gAAABCZR/VaeYbzgAADSAAAAEYyrbkWGaAFQiEYrGYiDQbCQBAANaXtzlv+ZzqgWk6P++7E3dov8D4MRSnL+YguASAtqmZv+CAAG0e2qZDv+8LmabT33w+g//+HHZHlIkXWavbf//vIj/fjv40GE+fK+UcAhKsFf/aeAIAAAqkAEYAKhosDThEeEobEp2e6g4WDsFZ3////lsNFjwKvBXeRWdVUxBTUUzLjEwMFVV//tUZOaA8kwnUWspGcQAAA0gAAABCYQ/N61lgAgAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tUZOmA8nEXystsMTIAAA0gAAABClxZLZXDAAgAADSCgAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tUZOcAAwwr025h4AQAAA0gwAAABSQC6bwAgCAAADSDgAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"