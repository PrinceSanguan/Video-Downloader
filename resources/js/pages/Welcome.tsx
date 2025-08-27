import { Button } from '@/components/ui/button';
import ColourfulText from '@/components/ui/colourful-text';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MultiStepLoader } from '@/components/ui/multi-step-loader';
import { SparklesCore } from '@/components/ui/sparkles';
import { Head, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';
import { useState } from 'react';

const loadingSteps = [
    {
        text: 'Analyzing video URL...',
    },
    {
        text: 'Detecting video platform...',
    },
    {
        text: 'Extracting video information...',
    },
    {
        text: 'Selecting optimal quality...',
    },
    {
        text: 'Downloading video content...',
    },
    {
        text: 'Processing video file...',
    },
    {
        text: 'Preparing download...',
    },
];

export default function Welcome() {
    const { props } = usePage();
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isValidUrl, setIsValidUrl] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasClickedImage, setHasClickedImage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [pendingDownload, setPendingDownload] = useState<{ data: string; filename: string } | null>(null);

    // URL validation function
    const validateUrl = (url: string): boolean => {
        if (!url.trim()) return false;

        const allowedDomains = [
            'youtube.com',
            'youtu.be',
            'm.youtube.com',
            'www.youtube.com',
            'tiktok.com',
            'vm.tiktok.com',
            'm.tiktok.com',
            'www.tiktok.com',
            'instagram.com',
            'instagr.am',
            'm.instagram.com',
            'www.instagram.com',
            'facebook.com',
            'fb.watch',
            'm.facebook.com',
            'www.facebook.com',
        ];

        try {
            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
            return allowedDomains.some((domain) => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`));
        } catch {
            return false;
        }
    };

    // Sanitize input to prevent script injection
    const sanitizeInput = (input: string): string => {
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    };

    // Download file from base64 data
    const downloadFile = (base64Data: string, filename: string) => {
        try {
            // Convert base64 to blob
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'video/mp4' });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download error:', error);
            setErrorMessage('Failed to download the file. Please try again.');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidUrl) return;
        // Show the modal instead of processing the download immediately
        setIsModalOpen(true);
        setErrorMessage('');
        setShowSuccess(false);
        setIsRateLimited(false);
    };

    const handleImageClick = () => {
        // Replace this URL with your actual Facebook page URL
        window.open('https://www.facebook.com/profile.php?id=61560390520092', '_blank');
        // Mark that user has clicked the image
        setHasClickedImage(true);
    };

    const handleDownloadClick = async () => {
        if (!hasClickedImage) {
            // If they haven't clicked the image yet, redirect to Facebook
            handleImageClick();
            return;
        }

        // Start the actual download process
        setIsLoading(true);
        setErrorMessage('');
        setShowSuccess(false);
        setIsRateLimited(false);
        setPendingDownload(null);

        try {
            // Get CSRF token from Inertia props or meta tag
            const csrfToken = (props as any)?.csrf_token || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const response = await fetch('/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    url: youtubeUrl,
                }),
            });

            const result = await response.json();

            if (response.status === 429) {
                // Rate limit exceeded - STOP loading immediately
                setIsLoading(false);
                setIsRateLimited(true);
                setErrorMessage(result.message || 'Too many requests. Please try again tomorrow.');
                setPendingDownload(null); // Clear any pending download
            } else if (result.success) {
                // Store the download data but don't trigger download yet
                if (result.data && result.data.file_data) {
                    setPendingDownload({
                        data: result.data.file_data,
                        filename: result.data.filename,
                    });
                }

                // Wait for loader to complete (duration * steps = total time)
                // Each step takes 2000ms, total steps = 7, so about 14 seconds
                setTimeout(() => {
                    setIsLoading(false);
                    setShowSuccess(true);

                    // Now trigger the download
                    if (pendingDownload || (result.data && result.data.file_data)) {
                        const downloadData = pendingDownload || result.data;
                        downloadFile(downloadData.file_data || downloadData.data, downloadData.filename);
                    }

                    // Close modal and reset form after successful download
                    setTimeout(() => {
                        setIsModalOpen(false);
                        setYoutubeUrl('');
                        setIsValidUrl(false);
                        setShowSuccess(false);
                        setHasClickedImage(false);
                        setPendingDownload(null);
                    }, 3000);
                }, 14000); // Wait for loader to complete (14 seconds)
            } else {
                setIsLoading(false);
                setErrorMessage(result.message || 'Download failed. Please try again.');
            }
        } catch (error) {
            console.error('Request error:', error);
            setIsLoading(false);
            setIsRateLimited(false);
            setPendingDownload(null);
            setErrorMessage('Network error. Please check your connection and try again.');
        }
    };

    const words = 'Welcome to Video Downloader with No Ads – Ultimate Free';

    return (
        <>
            <Head title="Video Downloader">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="relative flex h-[100vh] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-black">
                <div className="absolute inset-0 h-screen w-full">
                    <SparklesCore
                        id="tsparticlesfullpage"
                        background="transparent"
                        minSize={0.6}
                        maxSize={1.4}
                        particleDensity={100}
                        className="h-full w-full"
                        particleColor="#FFFFFF"
                    />
                </div>

                {/* Multi-Step Loader - only show when actually processing */}
                <MultiStepLoader loadingStates={loadingSteps} loading={isLoading} duration={2000} />

                <div className="relative z-20 flex flex-col items-center justify-center px-4 sm:px-6">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="text-2xl leading-tight font-bold sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                            <div className="mx-auto max-w-5xl">
                                <ColourfulText text={words} />
                            </div>
                        </div>

                        <div className="mt-4 mb-6 flex items-center justify-center gap-4 sm:mt-6 sm:mb-8">
                            <div className="flex items-center gap-2 rounded-lg bg-neutral-800 px-3 py-2 sm:gap-3 sm:px-4">
                                <span className="text-xs font-medium text-neutral-300 sm:text-sm">Supported:</span>
                                <div className="flex items-center gap-2">
                                    {/* YouTube */}
                                    <svg className="h-4 w-4 text-red-500 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.498 6.186a2.999 2.999 0 0 0-2.112-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.505A2.999 2.999 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.999 2.999 0 0 0 2.112 2.136c1.881.505 9.386.505 9.386.505s7.505 0 9.386-.505a2.999 2.999 0 0 0 2.112-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>

                                    {/* TikTok */}
                                    <svg className="h-4 w-4 text-white sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                    </svg>

                                    {/* Instagram */}
                                    <svg className="h-4 w-4 text-pink-500 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>

                                    {/* Facebook */}
                                    <svg className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4 sm:max-w-md">
                            <Input
                                type="url"
                                placeholder="Paste video URL here..."
                                value={youtubeUrl}
                                onChange={(e) => {
                                    const sanitizedValue = sanitizeInput(e.target.value);
                                    setYoutubeUrl(sanitizedValue);
                                    setIsValidUrl(validateUrl(sanitizedValue));
                                }}
                                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-base text-white placeholder-neutral-400 sm:px-4 sm:py-3 sm:text-lg"
                                required
                                disabled={isLoading}
                            />

                            {youtubeUrl && !isValidUrl && (
                                <p className="text-center text-xs text-red-400">
                                    Please enter a valid URL from YouTube, TikTok, Instagram, or Facebook
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={!isValidUrl || isLoading}
                                className={`w-full rounded-lg py-2 text-base font-semibold sm:py-3 sm:text-lg ${
                                    isValidUrl && !isLoading
                                        ? 'cursor-pointer bg-white text-black hover:bg-neutral-200'
                                        : 'cursor-not-allowed bg-neutral-600 text-neutral-400'
                                }`}
                                size="lg"
                            >
                                {isValidUrl ? 'Download Video' : 'Enter Valid URL'}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Modal for Facebook page follow */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="w-[95vw] max-w-sm rounded-lg p-4 sm:max-w-md sm:p-6">
                        <DialogHeader>
                            <DialogTitle className="text-center text-lg font-semibold sm:text-xl">
                                {isRateLimited ? 'Limit Reached!' : 'Support Our Channel!'}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col items-center space-y-4 py-2 sm:space-y-6 sm:py-4">
                            {/* Rate Limit UI */}
                            {isRateLimited ? (
                                <>
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                                            <Clock className="h-8 w-8 text-orange-600" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="mb-2 text-lg font-semibold text-gray-900">OOPS!</h3>
                                            <p className="px-4 text-sm leading-relaxed text-gray-600">
                                                You've reached your daily download limit. Please come back tomorrow to try again!
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => setIsModalOpen(false)}
                                            className="rounded-lg bg-orange-600 px-6 py-3 text-white hover:bg-orange-700"
                                        >
                                            Got It
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="px-2 text-center text-sm leading-relaxed text-gray-700 sm:text-base">
                                        Hello, before you download, can you please click the image and follow me on my FB page? It has a blue check
                                        mark so it's really legit.
                                    </p>

                                    {/* Facebook Page Image - Mobile Responsive */}
                                    <div
                                        className={`transform cursor-pointer transition-all duration-300 hover:scale-105 ${hasClickedImage ? 'ring-opacity-50 ring-2 ring-green-500' : ''}`}
                                        onClick={handleImageClick}
                                    >
                                        <img
                                            src="/assets/images/facebook.webp"
                                            alt="Facebook Page Preview"
                                            className="h-36 w-64 rounded-lg border border-gray-200 object-cover shadow-lg sm:h-44 sm:w-72 md:h-48 md:w-80"
                                        />
                                        <div className="mt-2 text-center text-xs text-gray-500 sm:text-sm">
                                            {hasClickedImage ? '✅ Thanks for following!' : 'Click to visit our Facebook page'}
                                        </div>
                                    </div>

                                    {/* Error Message in Modal */}
                                    {errorMessage && !isRateLimited && (
                                        <div className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-900/20 px-3 py-2 text-red-400">
                                            <AlertCircle className="h-4 w-4" />
                                            <p className="text-sm">{errorMessage}</p>
                                        </div>
                                    )}

                                    {/* Success Message in Modal */}
                                    {showSuccess && (
                                        <div className="flex items-center justify-center gap-2 rounded-lg border border-green-500/20 bg-green-900/20 px-3 py-2 text-green-400">
                                            <CheckCircle className="h-4 w-4" />
                                            <p className="text-sm">Download successful! Check your downloads folder.</p>
                                        </div>
                                    )}

                                    {/* Dynamic Download Button */}
                                    <Button
                                        onClick={handleDownloadClick}
                                        disabled={isLoading}
                                        className={`flex w-full items-center justify-center space-x-2 rounded-lg px-4 py-3 font-medium text-white transition-colors sm:w-auto sm:px-6 ${
                                            hasClickedImage
                                                ? isLoading
                                                    ? 'cursor-not-allowed bg-gray-600'
                                                    : 'bg-green-600 hover:bg-green-700'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-5 sm:w-5"></div>
                                                <span className="text-sm sm:text-base">Processing...</span>
                                            </>
                                        ) : hasClickedImage ? (
                                            <>
                                                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                                                <span className="text-sm sm:text-base">Download the Video</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                                <span className="text-sm sm:text-base">Follow & Get Download Link</span>
                                            </>
                                        )}
                                    </Button>

                                    {hasClickedImage && !isLoading && (
                                        <div className="flex items-center space-x-2 text-xs text-green-600 sm:text-sm">
                                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                            <span>Thank you for following! Ready to download.</span>
                                        </div>
                                    )}

                                    {!hasClickedImage && (
                                        <div className="flex items-center space-x-2 text-xs text-gray-600 sm:text-sm">
                                            <CheckCircle className="h-3 w-3 text-blue-600 sm:h-4 sm:w-4" />
                                            <span>Verified Official Page</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
