import React from "react";
import { Table, Card } from "react-bootstrap";

export default function SimulationTable({ data, totals }) {
  if (!data || data.length === 0) return null;

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header as="h5">Inventory Simulation Table</Card.Header>
      <Card.Body>
        <Table
          striped
          bordered
          hover
          responsive
          className="text-center align-middle"
        >
          <thead>
            <tr>
              <th>Cycle</th>
              <th>Day</th>
              <th>Beginning Inventory</th>
              <th>Random Digit (Demand)</th>
              <th>Demand</th>
              <th>Ending Inventory</th>
              <th>Backordering / Shortage</th>
              <th>Order Quantity</th>
              <th>Random Digit (Lead Time)</th>
              <th>Days Until Order Arrives</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={`${row.cycle}-${row.day}`}>
                <td>{row.cycle}</td>
                <td>{row.day}</td>
                <td>{row.beginningInventory}</td>
                <td>{row.demandRandomDigit}</td>
                <td>{row.demand}</td>
                <td>{row.endingInventory}</td>
                <td>{row.shortage > 0 ? row.shortage : "-"}</td>
                <td>{row.orderQuantity}</td>
                <td>{row.leadRandomDigit}</td>
                <td>
                  {row.daysUntilArrival !== null ? row.daysUntilArrival : "-"}
                </td>
              </tr>
            ))}
            {totals && (
              <tr className="fw-bold table-secondary">
                <td>Total</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>{totals.totalEndingInventory}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}