"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ImageUpload() {
  return (
    <div className="space-y-4">
      <Label>Images</Label>
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        <Input
          type="file"
          accept="image/*"
          className="hidden"
          id="image-upload"
          multiple
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="text-muted-foreground">
            <p className="text-lg">📷</p>
            <p>Cliquez pour uploader des images</p>
            <p className="text-sm">ou glissez-déposez</p>
          </div>
        </label>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {/* Uploaded images preview */}
      </div>
    </div>
  );
}
