import React from "react";
import { Table, Card } from "react-bootstrap";

export default function ProbabilityTable({ title, valueLabel = "Value", data }) {
  if (!data || data.length === 0) return null;

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header as="h5">{title}</Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive className="text-center">
          <thead>
            <tr>
              <th>{valueLabel}</th>
              <th>Probability</th>
              <th>Cumulative Probability</th>
              <th>Random-Digit Assignment</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{row.value}</td>
                <td>{Number(row.probability).toFixed(2)}</td>
                <td>{Number(row.cumulative).toFixed(2)}</td>
                <td>
                  {row.probability > 0
                    ? `${row.randomMin} - ${row.randomMax}`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}