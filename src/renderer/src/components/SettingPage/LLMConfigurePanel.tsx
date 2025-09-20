import { useLLMStore } from "@/store/llm";
import {
  Brain,
  ChevronDown,
  ChevronRight,
  Edit3,
  Key,
  Save,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { LLMConfig, LLMProvider } from "@/types/llm";

interface LLMField {
  key: keyof LLMConfig | "apiKey";
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}

const LLM_PROVIDERS: Record<LLMProvider, { name: string; fields: LLMField[] }> =
  {
    gemini: {
      name: "Google Gemini",
      fields: [
        { key: "apiKey", label: "API Key", type: "password", required: true },
        {
          key: "model",
          label: "Model",
          type: "text",
          placeholder: "gemini-2.5-flash",
        },
      ],
    },
    openai: {
      name: "ChatGPT (OpenAI)",
      fields: [
        { key: "apiKey", label: "API Key", type: "password", required: true },
        {
          key: "model",
          label: "Model",
          type: "text",
          placeholder: "gpt-5",
        },
      ],
    },
    claude: {
      name: "Claude (Anthropic)",
      fields: [
        { key: "apiKey", label: "API Key", type: "password", required: true },
        {
          key: "model",
          label: "Model",
          type: "text",
          placeholder: "claude-opus-4-20250514",
        },
      ],
    },
    xai: {
      name: "xAI Grok",
      fields: [
        { key: "apiKey", label: "API Key", type: "password", required: true },
        {
          key: "model",
          label: "Model",
          type: "text",
          placeholder: "grok-3-latest",
        },
      ],
    },
    ollama: {
      name: "Ollama",
      fields: [
        { key: "model", label: "Model", type: "text", required: true },
        {
          key: "baseUrl",
          label: "Base URL",
          type: "text",
          placeholder: "http://localhost:11434",
        },
      ],
    },
  };

export const LLMConfigurePanel: React.FC = () => {
  const { llmProvider, llmConfig, setLLMProvider, setLLMConfig } =
    useLLMStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [tempLlmConfig, setTempLlmConfig] = useState<
    LLMConfig & { apiKey?: string }
  >({
    model: llmConfig.model ?? "",
  });
  const [llmEditMode, setLlmEditMode] = useState(false);

  const handleEdit = () => {
    setTempLlmConfig({
      model: llmConfig.model ?? "",
    });
    setLlmEditMode(true);
  };

  const handleSave = async () => {
    const providerConfig = LLM_PROVIDERS[llmProvider];
    const apiKeyField = providerConfig.fields.find(
      (field) => field.key === "apiKey",
    );
    const modelField = providerConfig.fields.find(
      (field) => field.key === "model",
    );

    if (apiKeyField?.required && !tempLlmConfig.apiKey) {
      toast.error("Please fill in required field: API Key");
      return;
    }

    if (modelField?.required && !tempLlmConfig.model) {
      toast.error("Please fill in required field: Model");
      return;
    }

    if (tempLlmConfig.apiKey) {
      try {
        await window.electronAPI.llm.storeApiKey(
          tempLlmConfig.apiKey,
          llmProvider,
        );
      } catch (error) {
        console.error("Failed to store API key:", error);
        toast.error("Failed to store API key");
        return;
      }
    }

    setLLMProvider(llmProvider);
    setLLMConfig({
      model: tempLlmConfig.model ?? "",
    });

    setLlmEditMode(false);
    toast("Success", {
      description: "LLM configuration updated successfully.",
    });
  };

  const handleCancel = () => {
    setTempLlmConfig({
      model: llmConfig.model ?? "",
    });
    setLlmEditMode(false);
  };

  const handleConfigChange = (field: string, value: string) => {
    setTempLlmConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleProviderChange = (provider: LLMProvider) => {
    setTempLlmConfig({
      model: "",
      apiKey: "",
    });
    setLLMProvider(provider);
  };

  const renderConfigFields = () => {
    const provider = LLM_PROVIDERS[llmProvider];
    return provider.fields.map((field) => (
      <div key={field.key} className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            type={field.type}
            value={tempLlmConfig[field.key as keyof typeof tempLlmConfig] || ""}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors pr-10"
            placeholder={field.placeholder}
          />
        </div>
      </div>
    ));
  };

  const renderDisplayFields = () => {
    const provider = LLM_PROVIDERS[llmProvider];
    const fieldsWithValue = provider.fields
      .filter((field) => field.key !== "apiKey")
      .map((field) => {
        const value = llmConfig[field.key as keyof LLMConfig];
        return value ? { ...field, value } : null;
      })
      .filter((field): field is LLMField & { value: string } => field !== null);

    if (fieldsWithValue.length === 0) return null;

    return fieldsWithValue.map((field) => (
      <div key={field.key} className="space-y-1">
        <label className="text-sm font-medium text-muted-foreground">
          {field.label}
        </label>
        <div className="px-3 py-2 bg-muted/30 rounded-lg border-0">
          <code className="text-sm font-mono">{field.value}</code>
        </div>
      </div>
    ));
  };

  return (
    <div className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl rounded-lg">
      <div
        className="p-6 cursor-pointer hover:bg-muted/20 transition-colors duration-200 rounded-t-lg flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">LLM API Configuration</h2>
            <p className="text-sm text-muted-foreground">
              Configure your AI language model provider and API settings
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-border/50 space-y-4 animate-in fade-in slide-in-from-top duration-300">
          <div className="mt-4">
            {llmEditMode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    AI Provider
                  </label>
                  <Select
                    value={llmProvider}
                    onValueChange={(newValue) =>
                      handleProviderChange(newValue as LLMProvider)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LLM_PROVIDERS).map(([key, provider]) => (
                        <SelectItem key={key} value={key}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {renderConfigFields()}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Configuration
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">
                      Current Provider
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-600 rounded-full text-sm font-medium">
                        {LLM_PROVIDERS[llmProvider].name}
                      </span>
                      <span className="text-green-600 text-sm flex items-center gap-1">
                        <Key className="h-3 w-3" />
                        Configured
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 border border-border rounded-md hover:bg-muted/50 transition-colors flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Configure
                  </button>
                </div>
                {renderDisplayFields()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
