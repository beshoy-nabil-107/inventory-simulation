import { useState } from "react";
import {
  Button,
  Container,
  Form,
  Row,
  Col,
  Alert,
  ButtonGroup,
  Card,
  Spinner,
} from "react-bootstrap";
import ProbabilityTable from "./components/ProbabilityTable";
import SimulationTable from "./components/SimulationTable";
import PerformanceMeasures from "./components/PerformanceMeasures";

export default function App() {
  // Inputs States
  const [numCycles, setNumCycles] = useState("");
  const [reviewPeriod, setReviewPeriod] = useState("");
  const [initialInventory, setInitialInventory] = useState("");
  const [minInventoryLevel, setMinInventoryLevel] = useState("");
  const [orderQuantity, setOrderQuantity] = useState("");

  const [demandMin, setDemandMin] = useState("");
  const [demandMax, setDemandMax] = useState("");
  const [demandDist, setDemandDist] = useState("equal");
  const [demandProbs, setDemandProbs] = useState({});

  const [leadMin, setLeadMin] = useState("");
  const [leadMax, setLeadMax] = useState("");
  const [leadDist, setLeadDist] = useState("equal");
  const [leadProbs, setLeadProbs] = useState({});

  // Outputs States
  const [errorMessage, setErrorMessage] = useState("");
  const [demandTable, setDemandTable] = useState([]);
  const [leadTable, setLeadTable] = useState([]);
  const [simulationResults, setSimulationResults] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState(false);

  // Render Dynamic Inputs for "Different" Probabilities
  const renderDynamicInputs = (min, max, probsState, setProbsState) => {
    let inputs = [];
    let start = Number(min);
    let end = Number(max);

    if (start > end || min === "" || max === "") return null;

    for (let i = start; i <= end; i++) {
      inputs.push(
        <Form.Group key={i} as={Row} className="mb-2 align-items-center">
          <Form.Label column sm={4}>
            Value {i}:
          </Form.Label>
          <Col sm={8}>
            <Form.Control
              type="number"
              step="0.001"
              min="0"
              placeholder={`Probability for ${i}`}
              value={probsState[i] || ""}
              onChange={(e) =>
                // Update the specific probability for value i in the state
                setProbsState({ ...probsState, [i]: e.target.value })
              }
            />
          </Col>
        </Form.Group>,
      );
    }
    return inputs;
  };

  // Format random digit to 2-digit string
  const formatRandomString = (num) => {
    if (num === 100) return "00";

    return String(num).padStart(2, "0");
  };



///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
  const handleSimulate = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSimulationSuccess(false);
    setIsSimulating(true);

    setTimeout(() => {

      let cyclesCount = Number(numCycles);
      let periodDays = Number(reviewPeriod);
      let initInv = Number(initialInventory);
      let minInv = Number(minInventoryLevel);
      let ordQty = Number(orderQuantity);

      let dMin = Number(demandMin);
      let dMax = Number(demandMax);
      let lMin = Number(leadMin);
      let lMax = Number(leadMax);

      // 1. Validations
      if (cyclesCount <= 0) {
        setErrorMessage("Please enter a valid number of cycles.");
        setNumCycles("");
        setIsSimulating(false);
        return;
      }

      if (periodDays <= 0) {
        setErrorMessage("Please enter a valid review period.");
        setReviewPeriod("");
        setIsSimulating(false);
        return;
      }

      if (initialInventory === "" || initInv < 0) {
        setErrorMessage("Initial inventory cannot be negative.");
        setInitialInventory("");
        setIsSimulating(false);
        return;
      }

      if (minInventoryLevel === "" || minInv < 0) {
        setErrorMessage("Minimum inventory level cannot be negative.");
        setMinInventoryLevel("");
        setIsSimulating(false);
        return;
      }

      if (ordQty <= 0) {
        setErrorMessage("Order quantity must be greater than 0.");
        setOrderQuantity("");
        setIsSimulating(false);
        return;
      }

      if (dMin < 0 || dMin > dMax) {
        setErrorMessage(
          "Daily demand minimum cannot be negative or greater than maximum. Inputs cleared.",
        );
        setDemandMin("");
        setDemandMax("");
        setDemandProbs({});
        setIsSimulating(false);
        return;
      }

      if (lMin < 0 || lMin > lMax) {
        setErrorMessage(
          "Lead time minimum cannot be negative or greater than maximum. Inputs cleared.",
        );
        setLeadMin("");
        setLeadMax("");
        setLeadProbs({});
        setIsSimulating(false);
        return;
      }

      if (demandDist === "different") {
        let sumDemand = 0;
        for (let i = dMin; i <= dMax; i++) {
          let probVal = Number(demandProbs[i] || 0);
          if (probVal < 0) {
            setErrorMessage(
              "Daily demand probabilities cannot be negative. Inputs cleared.",
            );
            setDemandMin("");
            setDemandMax("");
            setDemandProbs({});
            setIsSimulating(false);
            return;
          }
          sumDemand += probVal;
        }

        // Check if the sum of probabilities == 1
        if (Math.abs(sumDemand - 1) > 0.001) {
          setErrorMessage(
            "Sum of Daily Demand probabilities must be exactly 1. Inputs cleared.",
          );
          setDemandMin("");
          setDemandMax("");
          setDemandProbs({});
          setIsSimulating(false);
          return;
        }
      }

      if (leadDist === "different") {
        let sumLead = 0;
        for (let i = lMin; i <= lMax; i++) {
          let probVal = Number(leadProbs[i] || 0);
          if (probVal < 0) {
            setErrorMessage(
              "Lead time probabilities cannot be negative. Inputs cleared.",
            );
            setLeadMin("");
            setLeadMax("");
            setLeadProbs({});
            setIsSimulating(false);
            return;
          }
          sumLead += probVal;
        }

        // Check if the sum of probabilities == 1
        if (Math.abs(sumLead - 1) > 0.001) {
          setErrorMessage(
            "Sum of Lead Time probabilities must be exactly 1. Inputs cleared.",
          );
          setLeadMin("");
          setLeadMax("");
          setLeadProbs({});
          setIsSimulating(false);
          return;
        }
      }


///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
      // 2. Build Probability Distribution Tables
      let generatedDemandTable = [];
      let prevDemandCumulative = 0;
      let demandCount = dMax - dMin + 1;

      for (let i = dMin; i <= dMax; i++) {
        let prob =
          demandDist === "equal"
            ? 1 / demandCount
            : Number(demandProbs[i] || 0);
        let cumulative = prevDemandCumulative + prob;

        // Calculate random digit ranges for daily demand
        let rMin = Math.round(prevDemandCumulative * 100) + 1;
        let rMax = Math.min(100, Math.round(cumulative * 100));

        generatedDemandTable.push({
          value: i,
          probability: prob,
          cumulative: cumulative,
          rMin: rMin, // raw integer for logic
          rMax: rMax,
          randomMin: formatRandomString(rMin), // string for UI Display
          randomMax: formatRandomString(rMax),
        });
        prevDemandCumulative = cumulative;
      }

      let generatedLeadTable = [];
      let prevLeadCumulative = 0;
      let leadCount = lMax - lMin + 1;

      for (let i = lMin; i <= lMax; i++) {
        let prob =
          leadDist === "equal" ? 1 / leadCount : Number(leadProbs[i] || 0);
        let cumulative = prevLeadCumulative + prob;

        // Calculate random digit ranges for lead time
        let rMin = Math.round(prevLeadCumulative * 100) + 1;
        let rMax = Math.min(100, Math.round(cumulative * 100));

        generatedLeadTable.push({
          value: i,
          probability: prob,
          cumulative: cumulative,
          rMin: rMin, // raw integer for logic
          rMax: rMax,
          randomMin: formatRandomString(rMin), // string for UI Display
          randomMax: formatRandomString(rMax),
        });
        prevLeadCumulative = cumulative;
      }

      setDemandTable(generatedDemandTable);
      setLeadTable(generatedLeadTable);

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

      // Find value from random digit
      const getValueFromRandom = (random, table) => {
        for (let i = 0; i < table.length; i++) {
          if (
            table[i].probability > 0 &&
            random >= table[i].rMin &&
            random <= table[i].rMax
          ) {
            return table[i].value;
          }
        }
        return table[table.length - 1].value;
      };


      // 3. Run Simulation Loop
      let resultsArray = [];
      let currentInventory = initInv;
      let currentShortage = 0;

      // Track pending order and remaining days until arrival
      let pendingOrderQty = 0;
      let daysUntilArrival = null;

      let totalEndingInventory = 0;
      let shortageDays = 0;
      let totalDays = cyclesCount * periodDays;

      for (let cycle = 1; cycle <= cyclesCount; cycle++) {
        for (let day = 1; day <= periodDays; day++) {
          // Check pending order countdown at the start of the day
          if (daysUntilArrival !== null) {
            if (daysUntilArrival === 0) {
              // Order arrives today
              currentInventory += pendingOrderQty;
              pendingOrderQty = 0;
              daysUntilArrival = null;
            } else {
              // Decrease remaining days until arrival
              daysUntilArrival--;
            }
          }

          let beginningInventory = currentInventory;

          // Generate random digit for daily demand
          let rawDemandRandom = Math.floor(Math.random() * 100) + 1;
          let demandRandomDigit = formatRandomString(rawDemandRandom);
          let demand = getValueFromRandom(rawDemandRandom, generatedDemandTable);

          // Calculate ending inventory and backordering/shortage
          let totalNeeded = demand + currentShortage;
          let endingInventory = 0;

          if (beginningInventory >= totalNeeded) {
            endingInventory = beginningInventory - totalNeeded;
            currentShortage = 0;
          } else {
            endingInventory = 0;
            currentShortage = totalNeeded - beginningInventory;
          }

          totalEndingInventory += endingInventory;

          // Count days with shortage
          if (currentShortage > 0) {
            shortageDays++;
          }

          // Check inventory at the end of each cycle to place a new order
          let placedOrderQty = "-";
          let leadRandomDigit = "-";

          if (
            day === periodDays &&
            endingInventory <= minInv &&
            daysUntilArrival === null
          ) {
            placedOrderQty = ordQty;

            // Generate random digit for lead time
            let rawLeadRandom = Math.floor(Math.random() * 100) + 1;
            leadRandomDigit = formatRandomString(rawLeadRandom);
            let leadTime = getValueFromRandom(rawLeadRandom, generatedLeadTable);

            pendingOrderQty = ordQty;
            daysUntilArrival = leadTime;
          }

          resultsArray.push({
            cycle: cycle,
            day: day,
            beginningInventory: beginningInventory,
            demandRandomDigit: demandRandomDigit,
            demand: demand,
            endingInventory: endingInventory,
            shortage: currentShortage,
            orderQuantity: placedOrderQty,
            leadRandomDigit: leadRandomDigit,
            daysUntilArrival: daysUntilArrival,
          });

          // Carry ending inventory to next day
          currentInventory = endingInventory;
        }
      }

      setSimulationResults(resultsArray);

      // 4. Calculate Performance Measures
      setPerformanceData({
        totalDays: totalDays,
        totalEndingInventory: totalEndingInventory,
        // avg ending inventory = total ending inventory / total days
        avgEndingInventory: (totalEndingInventory / totalDays).toFixed(2),
        shortageDays: shortageDays,
        // percentage of shortage days = (shortage days / total days) * 100
        shortagePercentage: ((shortageDays / totalDays) * 100).toFixed(2),
      });

      setIsSimulating(false);
      setSimulationSuccess(true);
    }, 500);
  };

  return (
    <Container className="py-5 position-relative">
      {/* Errors Alert */}
      {errorMessage && (
        <Alert
          variant="danger"
          onClose={() => setErrorMessage("")}
          dismissible
          style={{
            position: "fixed",
            top: "20px",
            left: "20px",
            zIndex: 1050,
            maxWidth: "350px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          {errorMessage}
        </Alert>
      )}

      <div className="text-center mb-4">
        <h1>Inventory Simulation</h1>
        <h6 className="text-muted d-flex align-items-center justify-content-center gap-2 mt-3">
          <div className="d-flex flex-column justify-content-center">
            <span>Developed by: Beshoy Nabil</span>
            <span>ID: 20240383</span>
          </div>
          <span>|</span>
          <span>Instructor: TA/Salma Essam Eldin</span>
        </h6>
      </div>

      {isSimulating ? (
        <div className="text-center my-5 py-5">
          {/* Loading spinner */}
          <Button variant="primary" disabled size="lg">
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            Calculating Simulation...
          </Button>
        </div>
      ) : (
        <div>
          <Form onSubmit={handleSimulate}>
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-primary text-white">
                General Settings
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Number of Cycles:</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        required
                        value={numCycles}
                        onChange={(e) => setNumCycles(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Review Period (Days):</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        required
                        value={reviewPeriod}
                        onChange={(e) => setReviewPeriod(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Initial Inventory:</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        required
                        value={initialInventory}
                        onChange={(e) => setInitialInventory(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Minimum Inventory Level:</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        required
                        value={minInventoryLevel}
                        onChange={(e) => setMinInventoryLevel(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Order Quantity:</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        required
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Row>
              {/* Daily Demand Settings */}
              <Col md={6}>
                <Card className="mb-4 shadow-sm">
                  <Card.Header>Daily Demand</Card.Header>
                  <Card.Body>
                    <Row className="mb-3">
                      <Col>
                        <Form.Control
                          type="number"
                          min="0"
                          placeholder="Min"
                          required
                          value={demandMin}
                          onChange={(e) => setDemandMin(e.target.value)}
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="number"
                          min="0"
                          placeholder="Max"
                          required
                          value={demandMax}
                          onChange={(e) => setDemandMax(e.target.value)}
                        />
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label className="d-block">
                        Distribution Setup:
                      </Form.Label>
                      <ButtonGroup className="mb-2 w-100">
                        <Button
                          className="fw-bold"
                          variant={
                            demandDist === "equal"
                              ? "primary"
                              : "outline-primary"
                          }
                          onClick={() => setDemandDist("equal")}
                        >
                          Equal Probabilities
                        </Button>
                        <Button
                          className="fw-bold"
                          variant={
                            demandDist === "different"
                              ? "primary"
                              : "outline-primary"
                          }
                          onClick={() => setDemandDist("different")}
                        >
                          Different Probabilities
                        </Button>
                      </ButtonGroup>
                      {demandDist === "equal" ? (
                        <Form.Text className="text-success d-block mt-2">
                          All possible values will have the same probability.
                        </Form.Text>
                      ) : (
                        <div className="mt-3 p-3 border rounded bg-light">
                          {renderDynamicInputs(
                            demandMin,
                            demandMax,
                            demandProbs,
                            setDemandProbs,
                          )}
                        </div>
                      )}
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>

              {/* Lead Time Settings */}
              <Col md={6}>
                <Card className="mb-4 shadow-sm">
                  <Card.Header>Lead Time (Days)</Card.Header>
                  <Card.Body>
                    <Row className="mb-3">
                      <Col>
                        <Form.Control
                          type="number"
                          min="0"
                          placeholder="Min"
                          required
                          value={leadMin}
                          onChange={(e) => setLeadMin(e.target.value)}
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="number"
                          min="0"
                          placeholder="Max"
                          required
                          value={leadMax}
                          onChange={(e) => setLeadMax(e.target.value)}
                        />
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label className="d-block">
                        Distribution Setup:
                      </Form.Label>
                      <ButtonGroup className="mb-2 w-100">
                        <Button
                          className="fw-bold"
                          variant={
                            leadDist === "equal" ? "primary" : "outline-primary"
                          }
                          onClick={() => setLeadDist("equal")}
                        >
                          Equal Probabilities
                        </Button>
                        <Button
                          className="fw-bold"
                          variant={
                            leadDist === "different"
                              ? "primary"
                              : "outline-primary"
                          }
                          onClick={() => setLeadDist("different")}
                        >
                          Different Probabilities
                        </Button>
                      </ButtonGroup>
                      {leadDist === "equal" ? (
                        <Form.Text className="text-success d-block mt-2">
                          All possible values will have the same probability.
                        </Form.Text>
                      ) : (
                        <div className="mt-3 p-3 border rounded bg-light">
                          {renderDynamicInputs(
                            leadMin,
                            leadMax,
                            leadProbs,
                            setLeadProbs,
                          )}
                        </div>
                      )}
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="text-center mb-5">
              <Button
                type="submit"
                variant="success"
                size="lg"
                className="px-5 shadow fw-bold"
              >
                Run Simulation
              </Button>
            </div>
          </Form>
        </div>
      )}

      {/* Render Results Components only if simulation is not running and successful */}
      {!isSimulating && simulationSuccess && simulationResults.length > 0 && (
        <div className="mt-4">
          <Row>
            <Col md={6}>
              <ProbabilityTable
                title="Daily Demand Probability Distribution"
                valueLabel="Daily Demand (Units)"
                data={demandTable}
              />
            </Col>
            <Col md={6}>
              <ProbabilityTable
                title="Lead-Time Probability Distribution"
                valueLabel="Lead Time (Days)"
                data={leadTable}
              />
            </Col>
          </Row>

          <SimulationTable data={simulationResults} totals={performanceData} />

          <Row className="justify-content-center">
            <Col md={8}>
              <PerformanceMeasures data={performanceData} />
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
}