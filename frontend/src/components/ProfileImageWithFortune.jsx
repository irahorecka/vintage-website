import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import Typewriter from 'typewriter-effect';

import profilePic from '../assets/profile-landscape.png';

const fortunes = [
  'You will debug something on the first try.',
  'A cat will sit on your keyboard today.',
  'Your semicolon brings harmony.',
  'Beware the infinite loop.',
  "Today's bug is tomorrow's feature.",
  '404: Fortune not found.',
  'You will discover a missing import at 2 AM.',
  'You’re one `console.log` away from brilliance.',
  'The merge conflict will resolve in your favor.',
  'Someone will star your repo today.',
  'A forgotten TODO will become your greatest idea.',
  'Your commit message will be poetry.',
  'A rogue tab will reveal itself to be a space.',
  'Your code will pass on the first CI run.',
  'You will rename a variable and feel peace.',
  'The compiler appreciates your efforts.',
  'A PR will arrive when you least expect it.',
];

const ProfileImageWithFortune = () => {
  const [showFortune, setShowFortune] = useState(false);
  const [fortune, setFortune] = useState('');
  const [unusedFortunes, setUnusedFortunes] = useState([...fortunes]);
  const [autoReset, setAutoReset] = useState(false);
  const [animationInProgress, setAnimationInProgress] = useState(false);

  const handleClick = () => {
    if (!showFortune) {
      setAnimationInProgress(true);
      if (unusedFortunes.length === 0) {
        setUnusedFortunes([...fortunes]);
      }
      const randomIndex = Math.floor(Math.random() * unusedFortunes.length);
      const newFortune = unusedFortunes[randomIndex];
      const updatedUnusedFortunes = unusedFortunes.filter(
        (_, i) => i !== randomIndex
      );
      setFortune(newFortune);
      setUnusedFortunes(updatedUnusedFortunes);
      setShowFortune(true);
      setAutoReset(false); // reset auto-reset flag
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
          transition: {
            duration: 0.5,
            delay: showFortune ? 0 : 0,
          },
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
