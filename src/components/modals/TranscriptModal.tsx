import { useState, useEffect } from "react";
import { X, FileText, Download } from "lucide-react";
import { axiosInstance } from "@/lib/axios";

interface TranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
}

interface TranscriptData {
  id: string;
  studentIdentityNumber: string;
  transcriptFileName: string;
  transcriptGpa: number;
  transcriptDate: string;
  transcriptDescription: string;
  departmentGraduationRank: string;
  facultyGraduationRank: string;
  universityGraduationRank: string;
  graduationYear: string;
  totalTakenCredit: number;
  totalRequiredCredit: number;
  completedCredit: number;
  remainingCredit: number;
  requiredCourseCount: number;
  completedCourseCount: number;
  studentId: string;
  studentName?: string;
  studentSurname?: string;
  departmentName?: string;
  facultyName?: string;
  studentNumber?: string;
  fileAttachment?: {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  };
}

export default function TranscriptModal({
  isOpen,
  onClose,
  studentId,
  studentName,
}: TranscriptModalProps) {
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchTranscript();
    }
  }, [isOpen, studentId]);

  const fetchTranscript = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the same endpoint as graduation-status page
      const response = await axiosInstance.get(
        `/transcripts?PageIndex=0&PageSize=100`
      );

      const transcripts = response.data.items || [];

      // Find the transcript for the specific student
      const studentTranscript = transcripts.find((t: any) => {
        return t.studentId === studentId;
      });

      if (studentTranscript) {
        // Get student details to populate missing fields
        try {
          const studentResponse = await axiosInstance.get(
            `/students/${studentId}`
          );
          const studentData = studentResponse.data;

          setTranscript({
            ...studentTranscript,
            studentName: studentData.name,
            studentSurname: studentData.surname,
            studentNumber: studentData.studentNumber,
            departmentName: studentData.departmentName,
            facultyName: studentData.facultyName,
          });
        } catch (studentErr) {
          // If we can't get student details, use the transcript data as is
          setTranscript(studentTranscript);
        }
      } else {
        setError("No transcript found for this student");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch transcript");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Transcript download functionality
    if (transcript) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Transcript - ${transcript.studentName || "Student"} ${
          transcript.studentSurname || ""
        }</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .student-info { margin-bottom: 20px; }
                .summary { margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Academic Transcript</h1>
                <h2>${transcript.studentName || "Student"} ${
          transcript.studentSurname || ""
        }</h2>
              </div>
              <div class="student-info">
                <p><strong>Student Number:</strong> ${
                  transcript.studentNumber ||
                  transcript.studentIdentityNumber ||
                  "N/A"
                }</p>
                <p><strong>Department:</strong> ${
                  transcript.departmentName || "N/A"
                }</p>
                <p><strong>Faculty:</strong> ${
                  transcript.facultyName || "N/A"
                }</p>
              </div>
              <div class="summary">
                <p><strong>GPA:</strong> ${
                  transcript.transcriptGpa?.toFixed(2) || "N/A"
                }</p>
                <p><strong>Total Required Credits:</strong> ${
                  transcript.totalRequiredCredit || "N/A"
                }</p>
                <p><strong>Completed Credits:</strong> ${
                  transcript.completedCredit || "N/A"
                }</p>
                <p><strong>Remaining Credits:</strong> ${
                  transcript.remainingCredit || "N/A"
                }</p>
                <p><strong>Graduation Year:</strong> ${
                  transcript.graduationYear || "Not graduated yet"
                }</p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Transcript - {studentName}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {transcript && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading transcript...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {transcript && (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Student Number:
                    </span>
                    <p className="text-gray-900">{transcript.studentNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Name:
                    </span>
                    <p className="text-gray-900">
                      {transcript.studentName} {transcript.studentSurname}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Department:
                    </span>
                    <p className="text-gray-900">{transcript.departmentName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Faculty:
                    </span>
                    <p className="text-gray-900">{transcript.facultyName}</p>
                  </div>
                </div>
              </div>

              {/* Academic Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Academic Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {transcript.transcriptGpa?.toFixed(2) || "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">GPA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {transcript.completedCredit || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Completed Credits
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {transcript.totalRequiredCredit || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Required Credits
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {transcript.remainingCredit || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Remaining Credits
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Course Progress
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Required Courses:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {transcript.requiredCourseCount || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Completed Courses:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {transcript.completedCourseCount || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Graduation Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Graduation Year:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {transcript.graduationYear || "Not graduated yet"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Department Rank:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {transcript.departmentGraduationRank || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {transcript.transcriptDescription && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-gray-900">
                      {transcript.transcriptDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
