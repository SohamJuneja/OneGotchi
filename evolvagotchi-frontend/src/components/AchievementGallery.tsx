import React, { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import type { Achievement } from '../services/achievementService';
import {
  sortAchievementsByRarity,
  filterAchievements,
  getAchievementStats,
  RARITY_GRADIENTS,
} from '../services/achievementService';
import AchievementBadge from './AchievementBadge';

interface AchievementGalleryProps {
  petTokenId?: number;
  compact?: boolean;
}

// Mock achievements data (replace with contract calls once deployed on OneChain)
const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 1, name: 'First Steps', description: 'Mint your first Evolvagotchi', rarity: 'Common', icon: '🥚', totalEarned: 0, earned: false },
  { id: 2, name: 'Caretaker', description: 'Feed your pet for the first time', rarity: 'Common', icon: '🍖', totalEarned: 0, earned: false },
  { id: 3, name: 'Playmate', description: 'Play with your pet for the first time', rarity: 'Common', icon: '🎮', totalEarned: 0, earned: false },
  { id: 4, name: 'Evolution Master', description: 'Evolve your pet to Adult stage', rarity: 'Rare', icon: '✨', totalEarned: 0, earned: false },
  { id: 5, name: 'Streak Master', description: 'Feed your pet 10 times in a row', rarity: 'Uncommon', icon: '🔥', totalEarned: 0, earned: false },
  { id: 6, name: 'Active Player', description: 'Play 10 games with your pet', rarity: 'Uncommon', icon: '🎯', totalEarned: 0, earned: false },
  { id: 7, name: 'Perfect Care', description: 'Reach 100 happiness, health, and 0 hunger', rarity: 'Epic', icon: '💎', totalEarned: 0, earned: false },
  { id: 8, name: 'Resurrection', description: 'Revive a dead pet', rarity: 'Rare', icon: '👻', totalEarned: 0, earned: false },
  { id: 9, name: 'Legendary Trainer', description: 'Own 5 Adult-stage pets', rarity: 'Legendary', icon: '🐲', totalEarned: 0, earned: false },
  { id: 10, name: 'Event Champion', description: 'Experience 50 random events', rarity: 'Epic', icon: '🎲', totalEarned: 0, earned: false },
];

export const AchievementGallery: React.FC<AchievementGalleryProps> = ({
  petTokenId,
  compact = false,
}) => {
  const currentAccount = useCurrentAccount();
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    // Load earned achievements from localStorage
    const loadAchievements = () => {
      const key = petTokenId 
        ? `achievements_pet_${petTokenId}`
        : currentAccount?.address 
          ? `achievements_user_${currentAccount.address}`
          : 'achievements_guest';
      
      const earnedStr = localStorage.getItem(key);
      const earnedIds = new Set<number>(earnedStr ? JSON.parse(earnedStr) : []);

      const achievementsWithStatus = ALL_ACHIEVEMENTS.map(ach => ({
        ...ach,
        earned: earnedIds.has(ach.id),
      }));

      setAchievements(sortAchievementsByRarity(achievementsWithStatus));
    };

    loadAchievements();
  }, [currentAccount?.address, petTokenId]);

  const filteredAchievements = filterAchievements(achievements, filter);
  const stats = getAchievementStats(achievements);

  if (compact) {
    // Compact view for PetDetail - show only earned badges
    const earnedBadges = achievements.filter((a) => a.earned);
    if (earnedBadges.length === 0) return null;

    return (
      <div className="achievements-compact">
        <div className="achievements-header-compact">
          <span>🏆 Achievements ({earnedBadges.length})</span>
        </div>
        <div className="badges-row">
          {earnedBadges.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} size="medium" />
          ))}
        </div>
      </div>
    );
  }

  // Full gallery view
  return (
    <div className="achievement-gallery">
      <div className="gallery-header">
        <h2>🏆 Achievement Gallery</h2>
        <div className="achievement-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.earned}/{stats.total}</div>
            <div className="stat-label">Unlocked</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round(stats.percentage)}%</div>
            <div className="stat-label">Complete</div>
          </div>
        </div>
      </div>

      <div className="gallery-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({achievements.length})
        </button>
        <button
          className={`filter-btn ${filter === 'earned' ? 'active' : ''}`}
          onClick={() => setFilter('earned')}
        >
          Earned ({stats.earned})
        </button>
        <button
          className={`filter-btn ${filter === 'locked' ? 'active' : ''}`}
          onClick={() => setFilter('locked')}
        >
          Locked ({stats.total - stats.earned})
        </button>
      </div>

      <div className="achievement-grid">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
            style={{
              background: achievement.earned
                ? RARITY_GRADIENTS[achievement.rarity]
                : 'linear-gradient(135deg, #374151 0%, #1F2937 100%)',
            }}
          >
            <div className="achievement-icon-large">{achievement.earned ? achievement.icon : '🔒'}</div>
            <div className="achievement-details">
              <h3>{achievement.earned ? achievement.name : '???'}</h3>
              <p className="achievement-description">
                {achievement.earned ? achievement.description : 'Complete the challenge to unlock!'}
              </p>
              <div className="achievement-rarity-badge" style={{ opacity: achievement.earned ? 1 : 0.5 }}>
                {achievement.earned ? achievement.rarity : 'Locked'}
              </div>
              {achievement.earned && achievement.totalEarned > 0 && (
                <div className="achievement-earned-count">
                  Earned by {achievement.totalEarned} {achievement.totalEarned === 1 ? 'player' : 'players'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="no-achievements">
          <p>No {filter} achievements to display</p>
        </div>
      )}
    </div>
  );
};

export default AchievementGallery;
