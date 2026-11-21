# Inventory Simulation

**[ Live Demo (Click Here)](#)**

## Overview
This project is a web-based Inventory Simulation system developed as Assignment 3 for the Modeling and Simulation course at Future University in Egypt. It simulates a periodic-review inventory system with backordering allowed, probabilistic daily demand, and probabilistic lead times, generating distribution tables, a complete day-by-day simulation table, and summary performance statistics.

## Features
* **Configurable Inventory Settings:** Supports custom inputs for the number of simulation cycles, inventory review period (days per cycle), initial inventory, minimum inventory level, and fixed order quantity.
* **Independent Probability Distributions:** Allows selecting "Equal" or "Different" probabilities independently for Daily Demand and Lead Time.
* **Smart Input Validation:** Validates that custom probability distributions sum to exactly 1 (100%) and automatically resets invalid input sections with floating alerts.
* **2-Digit Random Number Assignment:** Generates standard 2-digit random digit intervals (`01 - 00`) for demand and lead-time lookups.
* **Three Generated Tables:**
  1. Daily Demand Probability Distribution Table.
  2. Lead-Time Probability Distribution Table.
  3. Complete Inventory Simulation Table tracking beginning inventory, random digits, demand, ending inventory, accumulated shortages/backorders, order quantity, lead-time random digits, and days until order arrival.
* **Simulation Statistics:** Calculates total and average ending inventory along with shortage condition days and percentage.

## Technologies Used
* React.js
* React Bootstrap
* Vite

## How to Run Locally
1. Clone the repository:
   ```bash
   git clone [https://github.com/beshoy-nabil-107/inventory-simulation.git](https://github.com/beshoy-nabil-107/inventory-simulation.git)