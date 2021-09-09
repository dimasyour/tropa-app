import React from 'react';
import { Avatar } from '@vkontakte/vkui'

const teamStyles = {
    fontSize: 24,
    color: 'white',
}

const TeamAvatar = ({ team, size }) => {
    return (
        <Avatar size={ size ?? 48 } style={{backgroundColor: team?.color}}>
            <span style={teamStyles}>{team?.name?.slice(0, 1)}</span>
        </Avatar>
    );
}

export default TeamAvatar;
