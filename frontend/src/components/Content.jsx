import AstVisualizer from './AstVisualizer';
import CodingProjects from './CodingProjects';
import ContentRow from './ContentRow';
import Footer from './Footer';
import MetabolicNetwork from './MetabolicNetwork';
import ProfileSection from './ProfileSection';
import Sidebar from './Sidebar';
import WebProjects from './WebProjects';
import WhatsHot from './WhatsHot';

// Function to get the current date in the format "MONTH DAY"
function getCurrentDate() {
  const options = { month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
}
// Get the current year
const currentYear = new Date().getFullYear();

// Handle the addition of a content divider
const addContentDivider = () => {
  return (
    <div className="left-content">
      <div className="black-line"></div>
    </div>
  );
};

function Content() {
  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="main-content">
        <div id="home"></div>
        {/* Top Header */}
        <section className="top-header">
          <div className="quote-container">
            <h1>
              A point in every direction is the same as having no point at all.
            </h1>
            <h1>—Harry Nilsson</h1>
          </div>
          <div className="year-background">{currentYear}</div>
          <div className="date-banner">{getCurrentDate()}</div>
        </section>
        {/* Dual Content Row */}
        <ContentRow
          leftContent={<ProfileSection />}
          rightContent={<MetabolicNetwork />}
          topBorder={true}
          bottomBorder={true}
        />
        <WhatsHot />
        {/* Single Content Row (Duplicate Height but Single Content) */}
        <ContentRow
          leftContent={<ComicFinder />}
          singleColumn={true}
          id="comics"
        />
        {addContentDivider()}
        <ContentRow
          leftContent={<AstVisualizer />}
          singleColumn={true}
          id="ast"
        />
        {addContentDivider()}
        <ContentRow
          leftContent={<WebProjects />}
          singleColumn={true}
          id="web"
        />
        {addContentDivider()}
        <ContentRow
          leftContent={<CodingProjects />}
          singleColumn={true}
          id="coding"
        />
        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}

export default Content;
