# BudgetChecking Application

This is a simple monthly budget breakdown application. You can allocate your income, track your actual spending, and see the difference.

The application is built with a simple vanilla JavaScript frontend, an Express.js backend, and uses Vercel KV for data storage.

## How to Deploy to Vercel

1.  **Push to GitHub**: Make sure your project is in a GitHub repository.

2.  **Create Vercel Project**:
    *   Go to [vercel.com](https://vercel.com) and sign up or log in.
    *   Click "Add New..." -> "Project".
    *   Import your GitHub repository.
    *   Vercel will automatically detect the project settings from `package.json` and `vercel.json`. The framework preset should be "Other".

3.  **Set Up Vercel KV Store**:
    *   In your new Vercel project dashboard, go to the **Storage** tab.
    *   Select **KV (Redis)** and create a new database. Choose a region close to you.
    *   Connect the database to your project.
    *   Vercel will automatically create the `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables in your project settings. The application is already configured to use these.

4.  **Deploy**:
    *   Go to the **Deployments** tab.
    *   Trigger a new deployment for the `main` branch.
    *   Once the deployment is complete, you can visit your live application URL.

## How to Run Locally

To run this project on your local machine, you'll need to connect it to your Vercel KV store.

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <your-repo-url>
    cd BudgetChecking
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Create a `.env` file**: Create a file named `.env` in the root of the project.

4.  **Set Environment Variables**:
    *   Go to your Vercel project's settings and find the **Environment Variables** section.
    *   Copy the values for `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
    *   Add them to your `.env` file like this:
        ```
        KV_REST_API_URL="<your-kv-rest-api-url>"
        KV_REST_API_TOKEN="<your-kv-rest-api-token>"
        ```

5.  **Run the development server**:
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:3000`. 