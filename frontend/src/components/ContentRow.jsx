import React from 'react';

const ContentRow = ({ leftContent, rightContent, singleColumn = false, topBorder = false, bottomBorder = false }) => {
  return (
    <div className={`content-row ${singleColumn ? 'single-column' : ''}`}>
      <section className="left-content">
        {topBorder && <div className="blue-line top"></div>}
        {leftContent}
        {bottomBorder && <div className="blue-line bottom"></div>}
      </section>
      {!singleColumn && (
        <aside className="right-sidebar">
          {rightContent}
        </aside>
      )}
    </div>
  );
};

export default ContentRow;
