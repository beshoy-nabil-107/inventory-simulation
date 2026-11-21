import React from "react";
import { Table, Card } from "react-bootstrap";

export default function PerformanceMeasures({ data }) {
  if (!data) return null;

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header as="h5">Simulation Statistics</Card.Header>
      <Card.Body>
        <Table bordered hover responsive>
          <tbody>
            <tr>
              <td>
                <strong>1. Total Simulation Days</strong>
              </td>
              <td>{data.totalDays} days</td>
            </tr>
            <tr>
              <td>
                <strong>2. Total Ending Inventory</strong>
              </td>
              <td>{data.totalEndingInventory} units</td>
            </tr>
            <tr>
              <td>
                <strong>3. Average Ending Inventory</strong>
              </td>
              <td>{data.avgEndingInventory} units</td>
            </tr>
            <tr>
              <td>
                <strong>4. Shortage Condition Days</strong>
              </td>
              <td>
                {data.shortageDays} of {data.totalDays} days (
                {data.shortagePercentage}%)
              </td>
            </tr>
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}