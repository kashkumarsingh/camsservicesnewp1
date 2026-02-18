<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTrainerApplicationRequest;
use App\Models\TrainerApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class TrainerApplicationController extends Controller
{
    use BaseApiController;

    public function store(StoreTrainerApplicationRequest $request): JsonResponse
    {
        $email = $request->validated('email');

        $hasPending = TrainerApplication::query()
            ->where('email', $email)
            ->whereIn('status', [
                TrainerApplication::STATUS_SUBMITTED,
                TrainerApplication::STATUS_UNDER_REVIEW,
            ])
            ->exists();

        if ($hasPending) {
            return $this->errorResponse(
                'You already have a pending application. We\'ll be in touch shortly.',
                null,
                [],
                422
            );
        }

        $application = TrainerApplication::create([
            ...$request->validated(),
            'status' => TrainerApplication::STATUS_SUBMITTED,
        ]);

        app(\App\Contracts\Notifications\INotificationDispatcher::class)
            ->dispatch(\App\Services\Notifications\NotificationIntentFactory::trainerApplicationSubmittedToAdmin($application));

        return $this->successResponse([
            'id' => $application->id,
            'status' => $application->status,
        ], 'Thanks! A member of our team will review your application shortly.', [], 201);
    }

    /**
     * Applicant submits a response to an information request (public, token in body).
     *
     * POST /api/v1/trainer-applications/respond
     * Body: { "token": "encrypted payload from email link", "message": "required" }
     */
    public function respond(Request $request): JsonResponse
    {
        $token = $request->input('token');
        $message = $request->input('message');
        if (!is_string($token) || $token === '') {
            return $this->errorResponse('Invalid or missing link. Please use the link from your email.', null, [], 400);
        }
        if (!is_string($message) || trim($message) === '') {
            return $this->errorResponse('Please provide your response message.', null, [], 422);
        }
        try {
            $payload = json_decode(Crypt::decryptString($token), true);
        } catch (\Exception $e) {
            return $this->errorResponse('This link is invalid or has expired. Please contact us if you need a new link.', null, [], 400);
        }
        if (!is_array($payload) || empty($payload['id']) || empty($payload['email']) || empty($payload['exp'])) {
            return $this->errorResponse('Invalid link.', null, [], 400);
        }
        if ($payload['exp'] < time()) {
            return $this->errorResponse('This link has expired. Please contact us to request a new link.', null, [], 400);
        }
        $application = TrainerApplication::find($payload['id']);
        if (!$application || $application->email !== $payload['email']) {
            return $this->errorResponse('Application not found or link does not match.', null, [], 404);
        }
        try {
            $application->submitResponse(trim($message));
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), null, [], 422);
        }
        return $this->successResponse([
            'id' => (string) $application->id,
            'status' => $application->status,
        ], 'Thank you. We\'ve received your response and will continue reviewing your application.');
    }
}


