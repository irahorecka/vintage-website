import PropTypes from 'prop-types';

const ContentRow = ({
  leftContent,
  rightContent,
  singleColumn = false,
  topBorder = false,
  bottomBorder = false,
  id,
}) => {
  return (
    <div
      className={`content-row ${singleColumn ? 'single-column' : ''}`}
      // Keep anchor target optional so sections can opt into sidebar/hash navigation.
      {...(id && { id })}
    >
      <section className="left-content">
        {topBorder && <div className="blue-line top"></div>}
        {leftContent}
        {bottomBorder && <div className="blue-line bottom"></div>}
      </section>
      {!singleColumn && <aside className="right-sidebar">{rightContent}</aside>}
    </div>
  );
};

ContentRow.propTypes = {
  leftContent: PropTypes.node.isRequired,
  rightContent: PropTypes.node,
  singleColumn: PropTypes.bool,
  topBorder: PropTypes.bool,
  bottomBorder: PropTypes.bool,
  id: PropTypes.string,
};

export default ContentRow;
