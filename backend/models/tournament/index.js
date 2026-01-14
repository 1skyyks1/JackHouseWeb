// 赛事系统模型索引
const Tournament = require('./tournament');
const TStaff = require('./tStaff');
const TTeam = require('./tTeam');
const TPlayer = require('./tPlayer');
const TRound = require('./tRound');
const TMappool = require('./tMappool');
const TMatch = require('./tMatch');
const TGame = require('./tGame');
const TQualMappool = require('./tQualMappool');
const TQualScore = require('./tQualScore');
const User = require('../user/user');

// 定义模型关联

// Tournament 关联
Tournament.hasMany(TStaff, { foreignKey: 't_id', as: 'staff' });
Tournament.hasMany(TTeam, { foreignKey: 't_id', as: 'teams' });
Tournament.hasMany(TRound, { foreignKey: 't_id', as: 'rounds' });
Tournament.hasMany(TQualMappool, { foreignKey: 't_id', as: 'qualMaps' });

// TStaff 关联
TStaff.belongsTo(Tournament, { foreignKey: 't_id', as: 'tournament' });
TStaff.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// TTeam 关联
TTeam.belongsTo(Tournament, { foreignKey: 't_id', as: 'tournament' });
TTeam.belongsTo(User, { foreignKey: 'captain_id', as: 'captain' });
TTeam.hasMany(TPlayer, { foreignKey: 'team_id', as: 'players' });
TTeam.hasMany(TQualScore, { foreignKey: 'team_id', as: 'qualScores' });

// TPlayer 关联
TPlayer.belongsTo(TTeam, { foreignKey: 'team_id', as: 'team' });
TPlayer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// TRound 关联
TRound.belongsTo(Tournament, { foreignKey: 't_id', as: 'tournament' });
TRound.hasMany(TMappool, { foreignKey: 'round_id', as: 'mappool' });
TRound.hasMany(TMatch, { foreignKey: 'round_id', as: 'matches' });

// TMappool 关联
TMappool.belongsTo(TRound, { foreignKey: 'round_id', as: 'round' });

// TMatch 关联
TMatch.belongsTo(TRound, { foreignKey: 'round_id', as: 'round' });
TMatch.belongsTo(TTeam, { foreignKey: 'team1_id', as: 'team1' });
TMatch.belongsTo(TTeam, { foreignKey: 'team2_id', as: 'team2' });
TMatch.belongsTo(TTeam, { foreignKey: 'winner_id', as: 'winner' });
TMatch.hasMany(TGame, { foreignKey: 'match_id', as: 'games' });

// TGame 关联
TGame.belongsTo(TMatch, { foreignKey: 'match_id', as: 'match' });
TGame.belongsTo(TMappool, { foreignKey: 'map_id', as: 'map' });

// TQualMappool 关联
TQualMappool.belongsTo(Tournament, { foreignKey: 't_id', as: 'tournament' });
TQualMappool.hasMany(TQualScore, { foreignKey: 'map_id', as: 'scores' });

// TQualScore 关联
TQualScore.belongsTo(TQualMappool, { foreignKey: 'map_id', as: 'map' });
TQualScore.belongsTo(TTeam, { foreignKey: 'team_id', as: 'team' });
TQualScore.belongsTo(TPlayer, { foreignKey: 'player_id', as: 'player' });

module.exports = {
    Tournament,
    TStaff,
    TTeam,
    TPlayer,
    TRound,
    TMappool,
    TMatch,
    TGame,
    TQualMappool,
    TQualScore
};
