import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Typewriter from 'typewriter-effect';

import crystalGif from '../assets/crash-bandicoot-crystal.gif';
import profilePic from '../assets/profile-landscape.png';

const ProfileImageWithFortune = () => {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'fortune' | 'crystal'
  const [fortune, setFortune] = useState('');
  const [allFortunes, setAllFortunes] = useState([]);
  const [unusedFortunes, setUnusedFortunes] = useState([]);

  useEffect(() => {
    fetch(
      'https://raw.githubusercontent.com/larryprice/fortune-cookie-api/refs/heads/master/data/proverbs.txt'
    )
      .then((response) => response.text())
      .then((text) => {
        const lines = text
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0 && line.length <= 60);
        const processed = lines.map((line) => {
          line = line.replace(/\s+([,.!?:;])/g, '$1');
          return line.charAt(0).toUpperCase() + line.slice(1);
        });
        setAllFortunes(processed);
        setUnusedFortunes(processed);
      })
      .catch((error) => console.error('Error fetching fortunes:', error));
  }, []);

  const handleClick = () => {
    if (phase !== 'idle' || allFortunes.length === 0) return;
    const pool = unusedFortunes.length > 0 ? unusedFortunes : allFortunes;
    const idx = Math.floor(Math.random() * pool.length);
    setFortune(pool[idx]);
    setUnusedFortunes(pool.filter((_, i) => i !== idx));
    setPhase('fortune');
  };

  return (
    <div
      className="profile-image-container"
      onClick={handleClick}
      style={{ cursor: phase === 'idle' ? 'pointer' : 'default' }}
    >
      <img src={profilePic} alt="Profile" className="profile-image" draggable={false} />

      <AnimatePresence>
        {phase === 'fortune' && (
          <motion.div
            key="fortune"
            className="fortune-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="typewriter-wrapper">
              <Typewriter
                options={{ autoStart: true, delay: 45, cursor: '█' }}
                onInit={(typewriter) => {
                  typewriter
                    .pauseFor(600)
                    .typeString(fortune)
                    .pauseFor(1800)
                    .deleteAll(30)
                    .callFunction(() => setTimeout(() => setPhase('crystal'), 400))
                    .start();
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.img
        src={crystalGif}
        alt="Crystal"
        className="crystal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'crystal' ? 1 : 0 }}
        transition={{ duration: 0.5, delay: phase === 'crystal' ? 0.4 : 0 }}
      />
    </div>
  );
};

export default ProfileImageWithFortune;
