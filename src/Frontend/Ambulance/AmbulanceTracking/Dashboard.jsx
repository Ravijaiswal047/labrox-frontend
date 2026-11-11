import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import '../AmbulanceTracking/AmbulanceTracking.css';
import { FaBook, FaCar, FaTachometerAlt, FaUserTie } from 'react-icons/fa';
import { MdMiscellaneousServices } from 'react-icons/md';
import DashboardContent from './DashboardContent';
import Driver from './Driver';

function Dashboard() {
  return (
    // <div className="py-1 card">
    <Tab.Container id="left-tabs-example" className="background" defaultActiveKey="first">
      <Row className="main-container">
        <Col sm={2} className="sidebar-tabs screen-size p-0">
          <Nav variant="pills" className="flex-column">
            <Nav.Item>
              <Nav.Link eventKey="first"><FaTachometerAlt className="mr-2" /> Dashboard</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="second"><MdMiscellaneousServices className="mr-2" /> Master</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="third"><FaCar className="mr-2" /> Vehicles</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="fourth"><FaUserTie className="mr-2" /> Drivers</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="fifth"><FaBook className="mr-2"/>Reading</Nav.Link>
            </Nav.Item>
            
          </Nav>
        </Col>
        <Col sm={10} className="sidebar-tabs screen-size">
          <Tab.Content>
            <Tab.Pane eventKey="first"><DashboardContent/></Tab.Pane>
            <Tab.Pane eventKey="second">Master tab content</Tab.Pane>
            <Tab.Pane eventKey="third">Vehicles tab content</Tab.Pane>
            <Tab.Pane eventKey="fourth">Drivers tab content</Tab.Pane>
            <Tab.Pane eventKey="fifth">Reading tab content</Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
    // </div>
  );
}

export default Dashboard;