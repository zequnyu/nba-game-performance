import { createContext, useReducer } from 'react'
import axios from 'axios'
import useSWR from 'swr'

import teamsColor from '../public/teams_color.json';

import teams2018 from '../public/2018/teams.json';
import teamStats2018 from '../public/2018/team_stats_rankings.json';
import players2018 from '../public/2018/players.json';
import schedule2018 from '../public/2018/schedule.json';
import gameDates2018 from '../public/2018/game_dates.json';
import playersProfile2018 from '../public/2018/players_profile.json';

const fetcher = url => axios.get(url).then(res => res.data);

const useBoxScore = (season, date, hasGame) => {
    const url = (hasGame ? `/${season}/boxscore/${date}.json` : null);    
    const { data, error } = useSWR(url, fetcher);

    return {
        boxScoreData: data,
        isLoading: hasGame && !error && !data,
        isError: error
    }
}

const teamsArr2018 = teams2018.league.standard.filter(team => team.isNBAFranchise);

const SEASONS = [
    { 
        key: '2018', 
        fullName: '2018-2019',
        startDate: 'October 16, 2018',
        endDate: 'June 13, 2019',
        teams: teamsArr2018.map(team => {
            const t = teamsColor.colorInfo.find(tm => tm.TeamId === team.teamId);
            return {
                ...team,
                primaryColor: t.primaryColor,
                secondaryColor: t.secondaryColor
            }
        }),
        teamStats: teamStats2018.league.standard.regularSeason.teams
            .filter(team => new Set(teamsArr2018.map(team => team.teamId)).has(team.teamId)),
        players: players2018.league.standard.filter(player => player.isActive)
            .map(player => {
                const profile = playersProfile2018.find(p => p.id === player.personId);
                return {
                    ...player,
                    ...profile
                }
            }),
        schedule: schedule2018.league.standard,
        gameDates: gameDates2018.dates,
        disabledDates: gameDates2018.disabled
    },
];

const BAR_CATEGORIES = [
    {
        key: 'ppg',
        fullName: 'Points Per Game'
    },
    // {
    //     key: 'oppg',
    //     fullName: 'Opponents Points Per Game'
    // },
    // {
    //     key: 'eff',
    //     fullName: 'Efficiency'
    // },
    // {
    //     key: 'pfpg',
    //     fullName: 'Personal Fouls per Game'
    // },
    {
        key: 'bpg',
        fullName: 'Blocks Per Game'
    },
    {
        key: 'spg',
        fullName: 'Steals Per Game'
    },
    {
        key: 'apg',
        fullName: 'Assists Per Game'
    },
    // {
    //     key: 'tpg',
    //     fullName: 'Turnovers per game'
    // },
    // {
    //     key: 'trpg',
    //     fullName: 'Rebounds Per Game'
    // },
    {
        key: 'fgp',
        fullName: 'Field Goal Percentage'
    },
    {
        key: 'tpp',
        fullName: 'Three Point Percentage'
    },
    {
        key: 'ftp',
        fullName: 'Free Throw Percentage'
    }
];

const ACTION_TYPES = {
    SET_SEASON: 'SET_SEASON',
}

const Reducer = (state, action) => {
    switch (action.type) {
        case ACTION_TYPES.SET_SEASON:
            return {
                ...state,
                season: SEASONS.find(s => s.key === action.key)
            }        
        default:
            return state;
    }
}

const initialState = {
    season: SEASONS[0]
};

const NBAStore = ({ children = null}) => {
    const [state, dispatch] = useReducer(Reducer, initialState);
    return (
        <NBAContext.Provider value={[state, dispatch]}>
            {children}
        </NBAContext.Provider>
    )
};

const NBAContext = createContext(initialState);

export { fetcher, SEASONS, BAR_CATEGORIES, ACTION_TYPES, NBAStore, NBAContext, useBoxScore };
