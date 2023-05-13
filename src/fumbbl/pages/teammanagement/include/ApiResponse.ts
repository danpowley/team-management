export default class ApiResponse {
    private data: any;
    private isError: boolean = false;
    private errorMessage: string;

    public static success(data: any): ApiResponse {
        const apiResponse = new ApiResponse();
        apiResponse.data = data;
        return apiResponse;
    }

    public static error(error: any): ApiResponse {
        const apiResponse = new ApiResponse();
        apiResponse.isError = true;
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status >= 400 && error.response.status <= 499) {
                apiResponse.errorMessage = error.message;
            } else {
                apiResponse.errorMessage = `Unexpected error: (${error.message})`
            }
        } else if (error.request) {
            apiResponse.errorMessage = 'Request was made but no response was received';
        } else {
            apiResponse.errorMessage = error.message;
        }
        return apiResponse;
    }

    public static customErrorString(errorMessage: string): ApiResponse {
        const apiResponse = new ApiResponse();
        apiResponse.errorMessage = errorMessage;
        return apiResponse;
    }

    public getData(): any {
        return this.data;
    }

    public getErrorMessage(): any {
        return this.errorMessage;
    }

    public isSuccessful(): boolean {
        return ! this.isError;
    }
}