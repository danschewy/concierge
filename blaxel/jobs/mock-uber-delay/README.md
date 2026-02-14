# Blaxel TypeScript Job Template

<p align="center">
  <img src="https://blaxel.ai/logo.png" alt="Blaxel" width="200"/>
</p>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js 18+](https://img.shields.io/badge/node-18+-blue.svg)](https://nodejs.org/downloads/)
[![TypeScript](https://img.shields.io/badge/TypeScript-enabled-blue.svg)](https://www.typescriptlang.org/)
[![Blaxel Jobs](https://img.shields.io/badge/Blaxel_Jobs-powered-brightgreen.svg)](https://docs.blaxel.ai/)

</div>

A template implementation of a TypeScript job using Blaxel platform. This job demonstrates how to create scalable batch processing jobs with type-safe data handling and efficient task orchestration.

## 📑 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
  - [Running Locally](#running-the-job-locally)
  - [Testing](#testing-your-job)
  - [Deployment](#deploying-to-blaxel)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## ✨ Features

- Scalable batch job processing with TypeScript type safety
- Support for both local and production execution modes
- Flexible input methods (batch files, direct data, command line)
- Built on Blaxel platform for efficient job orchestration
- Type-safe data handling and validation
- Easy deployment and monitoring through Blaxel platform
- Sample batch files and configuration templates

## 🚀 Quick Start

For those who want to get up and running quickly:

```bash
# Clone the repository
git clone https://github.com/blaxel-ai/template-jobs-ts.git

# Navigate to the project directory
cd template-jobs-ts

# Install dependencies
npm install

# Run the job locally with sample data
bl run job jobs-ts --local --file batches/sample-batch.json

# Deploy to production
bl deploy
```

## 📋 Prerequisites

- **Node.js:** 18.0 or later
- **[NPM](https://www.npmjs.com/):** Node package manager
- **Blaxel Platform Setup:** Complete Blaxel setup by following the [quickstart guide](https://docs.blaxel.ai/Get-started#quickstart)
  - **[Blaxel CLI](https://docs.blaxel.ai/Get-started):** Ensure you have the Blaxel CLI installed. If not, install it globally:
    ```bash
    curl -fsSL https://raw.githubusercontent.com/blaxel-ai/toolkit/main/install.sh | BINDIR=/usr/local/bin sudo -E sh
    ```
  - **Blaxel login:** Login to Blaxel platform
    ```bash
    bl login YOUR-WORKSPACE
    ```

## 💻 Installation

**Clone the repository and install dependencies:**

```bash
git clone https://github.com/blaxel-ai/template-jobs-ts.git
cd template-jobs-ts
npm install
```

## 🔧 Usage

### Running the Job Locally

Test your job locally using different input methods:

```bash
# Run with a sample batch file
bl run job jobs-ts --local --file batches/sample-batch.json

# Run with direct data input
bl run job jobs-ts --local --data '{"tasks": [{"name": "John"}]}'

# Run without Blaxel CLI (direct Node.js execution)
npm start --name John
```

### Testing your job

You can test your job with various input scenarios:

```bash
# Test with different batch sizes
bl run job jobs-ts --local --data '{"tasks": [{"name": "Alice"}, {"name": "Bob"}, {"name": "Charlie"}]}'

# Test error handling
bl run job jobs-ts --local --data '{"tasks": [{"invalid": "data"}]}'
```

### Deploying to Blaxel

When you are ready to deploy your job:

```bash
bl deploy
```

After deployment, run the job in production:

```bash
# Run with a batch file in production
bl run job jobs-ts --file batches/sample-batch.json

# Run with direct data in production
bl run job jobs-ts --data '{"tasks": [{"name": "John"}]}'
```

## 📁 Project Structure

- **src/index.ts** - Job entry point and main execution logic
- **src/types/** - TypeScript type definitions
- **batches/** - Sample batch files for testing and examples
  - **sample-batch.json** - Example batch configuration
- **package.json** - Node.js package configuration
- **tsconfig.json** - TypeScript configuration
- **blaxel.toml** - Blaxel deployment configuration

## ❓ Troubleshooting

### Common Issues

1. **Blaxel Platform Issues**:
   - Ensure you're logged in to your workspace: `bl login MY-WORKSPACE`
   - Verify models are available: `bl get models`
   - Check that functions exist: `bl get functions`

2. **Job Execution Failures**:
   - Check input data format matches expected TypeScript types
   - Verify batch file JSON syntax is valid
   - Monitor job execution logs for error details

3. **TypeScript Compilation Errors**:
   - Run `npx tsc --noEmit` to check for type errors
   - Ensure all data types are properly defined
   - Check tsconfig.json configuration

4. **Data Processing Issues**:
   - Ensure task data contains required fields with correct types
   - Check for data type mismatches in input
   - Verify output format meets TypeScript interface requirements

5. **Performance and Scaling**:
   - Monitor job execution time for large batches
   - Consider batch size optimization for efficiency
   - Check memory usage during data processing

For more help, please [submit an issue](https://github.com/blaxel-templates/template-jobs-ts/issues) on GitHub.

## 👥 Contributing

Contributions are welcome! Here's how you can contribute:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Submit** a Pull Request

Please make sure to update tests as appropriate and follow the TypeScript code style of the project.

## 🆘 Support

If you need help with this template:

- [Submit an issue](https://github.com/blaxel-templates/template-jobs-ts/issues) for bug reports or feature requests
- Visit the [Blaxel Documentation](https://docs.blaxel.ai) for platform guidance
- Check the [Blaxel Jobs Documentation](https://docs.blaxel.ai/jobs) for job-specific help
- Join our [Discord Community](https://discord.gg/G3NqzUPcHP) for real-time assistance

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
