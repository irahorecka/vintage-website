import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import Typewriter from 'typewriter-effect';

import profilePic from '../assets/profile-landscape.png';

const ProfileImageWithFortune = () => {
  const [showFortune, setShowFortune] = useState(false);
  const [fortune, setFortune] = useState('');
  const [allFortunes, setAllFortunes] = useState([]);
  const [unusedFortunes, setUnusedFortunes] = useState([]);
  const [autoReset, setAutoReset] = useState(false);
  const [animationInProgress, setAnimationInProgress] = useState(false);

  // Fetch fortunes from external text file and filter those with 60 or less characters.
  // Also process each line:
  //   - Fix punctuation spacing (remove space before punctuation)
  //   - Capitalize the first letter.
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
        const processedLines = lines.map((line) => {
          // Remove extra spaces before punctuation
          line = line.replace(/\s+([,.!?:;])/g, '$1');
          // Capitalize first character if not already
          if (line.length > 0) {
            line = line.charAt(0).toUpperCase() + line.slice(1);
          }
          return line;
        });
        setAllFortunes(processedLines);
        setUnusedFortunes(processedLines);
      })
      .catch((error) => {
        console.error('Error fetching fortunes:', error);
      });
  }, []);

  const handleClick = () => {
    if (!showFortune) {
      setAnimationInProgress(true);
      if (unusedFortunes.length === 0) {
        setUnusedFortunes([...allFortunes]);
      }
      const randomIndex = Math.floor(Math.random() * unusedFortunes.length);
      const newFortune = unusedFortunes[randomIndex];
      const updatedUnusedFortunes = unusedFortunes.filter(
        (_, i) => i !== randomIndex
      );
      setFortune(newFortune);
      setUnusedFortunes(updatedUnusedFortunes);
      setShowFortune(true);
      setAutoReset(false);
    } else {
      setShowFortune(false);
      setFortune('');
      setAnimationInProgress(false);
    }
  };

  useEffect(() => {
    if (autoReset) {
      const timer = setTimeout(() => {
        handleClick(); // simulate click to revert to profile image
        setTimeout(() => {
          setAnimationInProgress(false);
        }, 500); // match fade-back timing
      }, 300); // short delay to let delete animation finish
      return () => clearTimeout(timer);
    }
  }, [autoReset]);

  return (
    <div
      className="profile-image-container"
      onClick={!animationInProgress ? handleClick : undefined}
      style={{ cursor: animationInProgress ? 'default' : 'pointer' }}
    >
      {/* Profile image */}
      <motion.img
        src={profilePic}
        alt="Profile"
        className="profile-image"
        initial={false}
        animate={{ opacity: showFortune ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Fortune text overlay */}
      <motion.div
        className="fortune-text"
        initial={false}
        animate={{
          opacity: showFortune ? 1 : 0,
          transition: { duration: 0.5, delay: showFortune ? 0.5 : 0 },
        }}
      >
        {fortune && (
          <div className="typewriter-wrapper">
            <Typewriter
              options={{
                autoStart: true,
                delay: 45,
                cursor: '█',
              }}
              onInit={(typewriter) => {
                typewriter
                  .pauseFor(500)
                  .typeString(fortune)
                  .pauseFor(2000)
                  .deleteAll(30)
                  .callFunction(() => {
                    setAutoReset(true);
                  })
                  .start();
              }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileImageWithFortune;
